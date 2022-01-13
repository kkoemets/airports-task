import { expect } from 'chai';
import {
  findAirport,
  initializeAirportsData,
} from '../../../src/airports-task/modules/airports';

describe('airports', function () {
  it('Initialize airports data', async function () {
    await initializeAirportsData();
  });

  it('Find airport', async function () {
    expect((await findAirport('TLL')).iataCode).to.equal('TLL');
  });

  it('Non-existing airport code returns undefined', async function () {
    expect(await findAirport('XXX')).to.equal(null);
  });
});
