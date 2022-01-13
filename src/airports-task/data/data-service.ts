import * as fs from 'fs';
import { log } from '../modules/logger';

interface Route {
  sourceAirport: string;
  destinationAirport: string;
}

interface Airport {
  iataCode: string | null;
  icaoCode: string;
  latitude: number;
  longitude: number;
}

export const findAllRoutes: () => Promise<Route[]> = async () => {
  const uniqueRouteFilterHelper = new Set<string>();
  return (await readFile('routes.dat'))
    .split(/\r?\n/)
    .map((line) => line.split(','))
    .map(([, , sourceAirport, , destinationAirport]) => ({
      sourceAirport,
      destinationAirport,
    }))
    .filter((route) => {
      const routeAsString: string = JSON.stringify(route);
      if (uniqueRouteFilterHelper.has(routeAsString)) {
        return false;
      }
      uniqueRouteFilterHelper.add(routeAsString);
      return true;
    });
};

export const findAllAirports: () => Promise<Airport[]> = async () => {
  log.debug('Finding all airports data');
  const commasOutsideDoubleQuotes = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  return (await readFile('airports.dat'))
    .split(/\r?\n/)
    .map((line) => line.split(commasOutsideDoubleQuotes))
    .map((line) => line)
    .map(([, , , , iataCode, icaoCode, latitude, longitude, , , , , , ,]) => {
      const iata = iataCode.replace(/"/g, '');
      const icao = icaoCode.replace(/"/g, '');

      return {
        iataCode: iata?.length === 3 && iata.match(/^[A-Z]+$/) ? iata : null,
        icaoCode: icao?.length === 4 && icao.match(/^[A-Z]+$/) ? icao : null,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    });
};

const readFile = (fileName): Promise<string> =>
  fs.promises.readFile(`${__dirname}/${fileName}`, 'utf8');
