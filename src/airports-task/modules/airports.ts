import { findAllAirports } from '../data/data-service';
import { log } from './logger';

export interface Airport {
  iataCode: string | null;
  icaoCode: string;
  latitude: number;
  longitude: number;
}

let airports: { [iataCode: string]: Airport } | null = null;
let icaoToIataDictionary: { [iataCode: string]: string } | null = null;

export const initializeAirportsData: () => Promise<void> = async () => {
  if (airports && icaoToIataDictionary) {
    log.warn('Airport data already initialized');
    return;
  }

  log.info('Initializing airport data');

  const allAirports: Airport[] = await findAllAirports();
  log.info('Creating airport mappings');
  if (!airports) {
    airports = allAirports
      .map((airport) => {
        return { [airport.iataCode]: airport };
      })
      .reduce((previousValue, currentValue) => {
        return { ...previousValue, ...currentValue };
      });
  }

  log.info('Creating iata/icao code mappings');
  if (!icaoToIataDictionary) {
    icaoToIataDictionary = allAirports
      .map((airport) => ({
        [airport.icaoCode]: airport.iataCode,
      }))
      .reduce((previousValue, currentValue) => {
        return { ...previousValue, ...currentValue };
      });
  }

  log.info(`Airports data initialized, size-${Object.keys(airports).length}`);
  return;
};

export const findAirport: (
  iataCode: string,
) => Promise<Airport | null> = async (iataCode: string) => {
  log.debug(`Finding airport-${iataCode} data`);
  if (!airports) {
    await initializeAirportsData();
  }

  const airport: Airport = airports[iataCode];
  if (!airport) {
    log.warn(`Failed to find airport-${iataCode} data`);
    return null;
  }

  log.debug(`Found airport-${iataCode} data`);
  return airport;
};

export const convertIcaoCodeToIataCode: (icaoCode) => string | undefined = (
  icaoCode,
) => {
  return icaoToIataDictionary[icaoCode];
};
