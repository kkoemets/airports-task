import {
  AdjacencyList,
  aStar,
  initializeAdjacencyList,
  ShortestRoute,
} from '../../../../src/airports-task/modules/graph/graph';
import { expect } from 'chai';

// Tests are slow independently, each time airport/adjacency data is created again
describe('graph', function () {
  it('createAdjacencyList', async function () {
    const list: AdjacencyList = await initializeAdjacencyList();
    expect(Object.entries(list).length).to.equal(3418);
  });

  it('aStar - TLL -> LHR', async function () {
    expect(JSON.stringify(await aStar('TLL', 'LHR'))).to.equal(
      '{"routeIataCodes":["TLL","CPH","LHR"],"routeLength":"1821km"}',
    );
  });

  it('aStar - TLL -> TPE', async function () {
    expect(JSON.stringify(await aStar('TLL', 'TPE'))).to.equal(
      '{"routeIataCodes":["TLL","LED","PEK","TPE"],"routeLength":"8097km"}',
    );
  });

  it('aStar - TLL -> SFO', async function () {
    expect(JSON.stringify(await aStar('TLL', 'SFO'))).to.equal(
      '{"routeIataCodes":["TLL","TRD","KEF","YEG","SFO"],"routeLength":"9298km"}',
    );
  });

  it('aStar - TLL -> LAX', async function () {
    const value: ShortestRoute = await aStar('TLL', 'LAX');
    expect(JSON.stringify(value)).to.equal(
      '{"routeIataCodes":["TLL","ARN","LAX"],"routeLength":"9264km"}',
    );
  });

  it('aStar - HND -> TLL', async function () {
    const value: ShortestRoute = await aStar('HND', 'TLL');
    expect(JSON.stringify(value)).to.equal(
      '{"routeIataCodes":["HND","NGO","HEL","TLL"],"routeLength":"8152km"}',
    );
  });

  it('aStar - non-existing from code', async function () {
    const result = await aStar('XXX', 'LHR');
    expect(result).to.equal(null);
  });

  it('aStar - non-existing to code', async function () {
    const result = await aStar('TLL', 'XXX');
    expect(result).to.equal(null);
  });

  it('aStar - TLL -> TPI', async function () {
    expect(await aStar('TLL', 'TPI')).to.equal(null);
  });

  it('aStar - TPI -> TLL', async function () {
    expect(await aStar('TPI', 'TLL')).to.equal(null);
  });
});
