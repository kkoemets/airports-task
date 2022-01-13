import { findAllRoutes } from '../../data/data-service';
import { PriorityQueue, PriorityQueueValue } from './classes/priority-queue';
import { HeuristicValueContainer } from './classes/heuristic-value-container';
import { RouteStack, RouteStackValue } from './classes/route-stack';
import { DistanceContainer } from './classes/distance-container';
import { log } from '../logger';
import { findAirport } from '../airports';
import * as NodeCache from 'node-cache';
import { isNumber } from '../numbers';

let adjacencyList: AdjacencyList | null = null;

export interface AdjacencyList {
  [destination: string]: string[]; // string list is source nodes to destination
}

export const initializeAdjacencyList: () => Promise<AdjacencyList> =
  async () => {
    if (adjacencyList) {
      log.warn('Adjacency list already exists');
      return adjacencyList;
    }

    log.info('Initializing adjacency list');

    const listCollector: AdjacencyList = {};
    (await findAllRoutes()).forEach(({ destinationAirport, sourceAirport }) => {
      const sources: string[] = listCollector[destinationAirport];
      if (!sources) {
        listCollector[destinationAirport] = [sourceAirport];
      } else {
        sources.push(sourceAirport);
      }
    });

    adjacencyList = Object.entries(listCollector)
      .map(([destination, sources]) => ({
        [destination]: [...new Set(sources)],
      }))
      .reduce((previousValue, currentValue) => ({
        ...previousValue,
        ...currentValue,
      }));

    log.debug(
      'Adjacency list created, size-' + Object.keys(adjacencyList).length,
    );
    return adjacencyList;
  };

const routeResultCache = new NodeCache({ stdTTL: 900 });
const distances = new DistanceContainer();
const maximumFlights = 4;

export interface ShortestRoute {
  routeLength: string;
  routeIataCodes: string[];
}

export const aStar: (
  from: string,
  to: string,
) => Promise<ShortestRoute | null> = async (from: string, to: string) => {
  log.debug(`Using A* algorithm to find shortest path from-${from} to-${to}`);

  const cacheKey: string = from + to;
  const cachedValue: ShortestRoute | undefined = routeResultCache.get(cacheKey);
  if (cachedValue) {
    log.debug(`Found cached result-${JSON.stringify(cachedValue)}`);
    return cachedValue;
  }

  if (!(await findAirport(from)) || !(await findAirport(to))) {
    return null;
  }

  if (!adjacencyList) {
    await initializeAdjacencyList();
  }

  if (!adjacencyList[from] || !adjacencyList[to]) {
    log.debug('Missing adjacency list for from or to airport');
    return null;
  }

  const queue: PriorityQueue = new PriorityQueue();
  const heuristics = new HeuristicValueContainer();
  const stack = new RouteStack();
  await addInitialQueueValues(to, heuristics, from, queue);

  while (!queue.isEmpty()) {
    const currentQueueValue: PriorityQueueValue = queue.shift();
    const currentPathVia: string[] = currentQueueValue.pathVia;
    if (currentPathVia.length > maximumFlights) {
      log.debug(
        `Path-${currentPathVia} exceeds maximum flight limitation of-${maximumFlights}`,
      );
      continue;
    }
    stack.add(currentQueueValue);

    const currentNodeName: string = currentQueueValue.node;
    if (currentNodeName === from) {
      log.debug('Retrieved result from priority queue');
      break;
    }
    await addQueueValues(
      currentNodeName,
      heuristics,
      from,
      currentQueueValue,
      currentPathVia,
      queue,
    );
  }

  const resultingRoute: RouteStackValue | undefined = stack.stack
    .reverse()
    .find(({ node }) => node === from);

  if (!resultingRoute) {
    log.info(`Unable find route with less than ${maximumFlights} flights`);
    return null;
  }

  const routeIataCodes: string[] = [
    resultingRoute.node,
    ...[...resultingRoute.pathVia].reverse(),
  ];

  const result: ShortestRoute = {
    routeIataCodes,
    routeLength: resultingRoute.distance + 'km',
  };

  log.debug(
    `Resulting path from-${from} to-${to} is-${JSON.stringify(result)}`,
  );

  routeResultCache.set(cacheKey, result);

  return result;
};

const addInitialQueueValues = async (
  to: string,
  heuristics: HeuristicValueContainer,
  from: string,
  queue: PriorityQueue,
): Promise<void> => {
  const adjacencyListElement: string[] | undefined = adjacencyList[to];
  if (!adjacencyListElement) {
    return;
  }
  (
    await Promise.all(
      adjacencyListElement.map(async (nodeName) => {
        if (!heuristics.get(nodeName)) {
          const heuristicDistance: number | null = await distances.get(
            from,
            nodeName,
          );

          if (!isNumber(heuristicDistance)) {
            return null;
          }

          heuristics.add(nodeName, heuristicDistance);
        }

        const distance: number | null = await distances.get(nodeName, to);
        if (!isNumber(distance)) {
          return null;
        }

        return {
          node: nodeName,
          distance: distance,
          pathVia: [to],
          combinedHeuristic: heuristics.get(nodeName) + distance,
        };
      }),
    )
  )
    .filter((value) => value)
    .forEach((value) => queue.add(value));
};

const addQueueValues = async (
  currentNodeName: string,
  heuristics: HeuristicValueContainer,
  from: string,
  currentQueueValue: PriorityQueueValue,
  currentPathVia: string[],
  queue: PriorityQueue,
): Promise<void> => {
  const adjacencyListElement: string[] | undefined =
    adjacencyList[currentNodeName];
  if (!adjacencyListElement) {
    return;
  }
  (
    await Promise.all(
      adjacencyListElement.map(async (nodeName) => {
        if (!heuristics.get(nodeName)) {
          const heuristicDistance: number | null = await distances.get(
            from,
            nodeName,
          );

          if (!isNumber(heuristicDistance)) {
            return null;
          }

          heuristics.add(nodeName, heuristicDistance);
        }

        const distanceBetweenCurrentNodeAndAdjacentNode: number | null =
          await distances.get(nodeName, currentNodeName);
        if (!isNumber(distanceBetweenCurrentNodeAndAdjacentNode)) {
          return null;
        }

        const distance =
          currentQueueValue.distance +
          distanceBetweenCurrentNodeAndAdjacentNode;

        return {
          node: nodeName,
          distance,
          pathVia: [...currentPathVia, currentNodeName],
          combinedHeuristic: distance + heuristics.get(nodeName),
        } as PriorityQueueValue;
      }),
    )
  )
    .filter((value) => value)
    .forEach((value) => queue.add(value));
};
