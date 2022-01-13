import { DistanceContainer } from '../../../../../src/airports-task/modules/graph/classes/distance-container';
import { expect } from 'chai';

describe('DistanceContainer', function () {
  it('Find distance', async function () {
    const container: DistanceContainer = new DistanceContainer();

    expect(await container.get('TLL', 'TPE')).to.equal(7985);
  });

  it('Non-existing from code returns null', async function () {
    const container: DistanceContainer = new DistanceContainer();

    expect(await container.get('XXX', 'TPE')).to.equal(null);
  });

  it('Non-existing to code returns null', async function () {
    const container: DistanceContainer = new DistanceContainer();

    expect(await container.get('TLL', 'XXX')).to.equal(null);
  });
});
