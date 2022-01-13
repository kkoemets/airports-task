import { Airport, findAirport } from '../../airports';
import { getDistance } from 'geolib';
import { log } from '../../logger';
import { isNumber, roundNumber } from '../../numbers';

const findGeographicalDistanceBetweenAirports = async (
  from,
  to,
): Promise<number | null> => {
  log.debug(`Finding distance between ${from} and ${to}`);
  const fromAirport: Airport | null = await findAirport(from);
  if (!fromAirport) {
    log.warn(`Failed to find airport-${from}`);
    return null;
  }
  const toAirport: Airport | null = await findAirport(to);
  if (!toAirport) {
    log.warn(`Failed to find airport-${to}`);
    return null;
  }

  if (!fromAirport.longitude || !fromAirport.latitude) {
    log.warn(`Missing coordinates for-${from}`);
    return null;
  }

  if (!toAirport.longitude || !toAirport.latitude) {
    log.warn(`Missing coordinates for-${to}`);
    return null;
  }

  const distanceValue: number = getDistance(
    { latitude: fromAirport.latitude, longitude: fromAirport.longitude },
    { latitude: toAirport.latitude, longitude: toAirport.longitude },
  );

  log.debug(`Found distance between ${from} and ${to} ${distanceValue} meters`);

  return roundNumber(distanceValue / 1000, 0);
};

interface Container {
  [nodePair: string]: number | undefined;
}

export class DistanceContainer {
  private _container: Container = {};

  async get(from: string, to: string): Promise<number | null> {
    const containerKey = from > to ? from + to : to + from;
    const storedDistance: number | undefined | null =
      this._container[containerKey];
    if (isNumber(storedDistance)) {
      return storedDistance;
    }

    const distance: number | null =
      await findGeographicalDistanceBetweenAirports(from, to);

    this._container[containerKey] = isNumber(distance) ? distance : null;

    return this._container[containerKey];
  }
}
