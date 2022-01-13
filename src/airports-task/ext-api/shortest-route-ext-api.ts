import { aStar, ShortestRoute } from '../modules/graph/graph';
import { StatusCodes } from 'http-status-codes';
import { log } from '../modules/logger';
import { convertIcaoCodeToIataCode, findAirport } from '../modules/airports';

export interface ShortestRouteResponse {
  status: StatusCodes;
  data?: { airportCodes: string[]; routeLength: string };
  error?: string;
}

export const findShortestRouteByIataApi: ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => Promise<ShortestRouteResponse> = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  log.info(`Received request to find shortest route from-${from} to-${to}`);

  if (!from || !to) {
    log.info('Missing required request parameters');
    return {
      error: 'Missing query params ´from´ or/and ´to´',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  const iataFromNormalized = from.trim().toUpperCase();
  const iataToNormalized = to.trim().toUpperCase();

  if (iataFromNormalized.length !== 3 || iataToNormalized.length !== 3) {
    log.info('Request params have invalid length');
    return {
      error: 'Invalid query params ´from´ or/and ´to´',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  if (iataFromNormalized === iataToNormalized) {
    return {
      error: '´from´ and ´to´ params are the same',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  if (!(await findAirport(iataFromNormalized))) {
    return {
      error: `Could not find airport-${iataFromNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  if (!(await findAirport(iataToNormalized))) {
    return {
      error: `Could not find airport-${iataToNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  const shortestRoute: ShortestRoute | null = await aStar(
    iataFromNormalized,
    iataToNormalized,
  );

  if (!shortestRoute) {
    log.info('Search algorithm did not find route');
    return {
      error: `Unable to find path from-${iataFromNormalized} to-${iataToNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  return {
    data: {
      airportCodes: shortestRoute.routeIataCodes,
      routeLength: shortestRoute.routeLength,
    },
    status: StatusCodes.OK,
  };
};

export const findShortestRouteByIcaoApi: ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => Promise<ShortestRouteResponse> = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  log.info(`Received request to find shortest route from-${from} to-${to}`);

  if (!from || !to) {
    return {
      error: 'Missing query params ´from´ or/and ´to´',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  const icaoFromNormalized: string = from.trim().toUpperCase();
  const icaoToNormalized: string = to.trim().toUpperCase();

  if (icaoFromNormalized.length !== 4 || icaoToNormalized.length !== 4) {
    log.info('Request params have invalid length');
    return {
      error: 'Invalid query params ´from´ or/and ´to´',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  if (icaoFromNormalized === icaoToNormalized) {
    return {
      error: '´from´ and ´to´ params are the same',
      status: StatusCodes.BAD_REQUEST,
    };
  }

  const iataFrom: string | undefined =
    convertIcaoCodeToIataCode(icaoFromNormalized);
  if (!iataFrom) {
    return {
      error: `Could not find airport-${icaoFromNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  const iataTo: string | undefined =
    convertIcaoCodeToIataCode(icaoToNormalized);
  if (!iataTo) {
    return {
      error: `Could not find airport-${icaoToNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  const shortestRoute: ShortestRoute | null = await aStar(iataFrom, iataTo);

  if (!shortestRoute) {
    log.info('Search algorithm did find route');
    return {
      error: `Unable to find path from-${icaoFromNormalized} to-${icaoToNormalized}`,
      status: StatusCodes.NOT_FOUND,
    };
  }

  const airportCodes: string[] = await Promise.all(
    shortestRoute.routeIataCodes.map(
      async (iataCode) => (await findAirport(iataCode)).icaoCode,
    ),
  );

  if (airportCodes.filter((code) => !code).length > 0) {
    log.error('Could not translate iata codes back to icao');
    return {
      error: 'Something went wrong!',
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    };
  }

  return {
    data: {
      airportCodes,
      routeLength: shortestRoute.routeLength,
    },
    status: StatusCodes.OK,
  };
};
