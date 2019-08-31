const { describe, it, before } = require('mocha');
const { assert } = require('chai');

const { Prerenderer } = require('../../../dist/lib/Prerenderer');
const { Logger } = require('../../../dist/lib/Logger');
const { Config } = require('../../../dist/lib/Config');

describe('prerenderer property checks after initialization', async () => {
  /**
   * @type {Prerenderer}
   */
  let p;

  before(async () => {
    p = new Prerenderer();
    await p.initialize();
  });

  it('logger should be a Logger instance.', async () => {
    assert.instanceOf(p.getLogger(), Logger);
  });

  it('config should be a Config instance.', async () => {
    assert.instanceOf(p.getConfig(), Config);
  });

  it('last response is not set when no prerenders were made.', async () => {
    assert.notOk(p.getLastResponse());
  });
});
