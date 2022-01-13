import { expect } from 'chai';
import {
  findAllAirports,
  findAllRoutes,
} from '../../../src/airports-task/data/data-service';

describe('dataService', function () {
  it('Find all routes - assert amount', async function () {
    expect((await findAllRoutes()).length).to.equal(37595);
  });

  it('Find all airport - assert amount', async function () {
    const airports = await findAllAirports();
    const expectedAirportAmount = 12669;
    expect(airports.length).to.equal(expectedAirportAmount);

    expect(
      airports.filter(({ iataCode }) => iataCode?.length === 3).length,
    ).to.equal(6734);

    expect(
      airports.filter(({ icaoCode }) => {
        return icaoCode?.length === 4;
      }).length,
    ).to.equal(7952);

    expect(airports.filter(({ latitude }) => isNaN(latitude)).length).to.equal(
      0,
    );

    expect(
      airports.filter(({ longitude }) => isNaN(longitude)).length,
    ).to.equal(0);
  });
});
