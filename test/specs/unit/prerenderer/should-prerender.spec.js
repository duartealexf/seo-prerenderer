const { describe, it } = require('mocha');
const { assert } = require('chai');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');

const { createDirectHttpGetRequest, createDirectHttpPostRequest } = require('../../../static-client');
const { Prerenderer } = require('../../../../dist/lib/prerenderer');

describe('whether it should prerender', () => {
  /**
   * @type {import('../../../../dist/types/config/defaults').PrerendererConfigParams}
   */
  const initialConfig = {
    nodeEnv: 'development',
    prerendererLogFile: join('test', 'tmp', `${uuidv4()}.log`),
    snapshotsDirectory: join('test', 'tmp', uuidv4()),
    snapshotsDriver: 'fs',
  };

  /**
   * @type {import('../../../../dist/types/prerenderer').ReasonsToRejectPrerender}
   */
  let reasonToRejectLastPrerender;

  it('should not prerender if there is no request.', async () => {
    const p = new Prerenderer();
    await p.initialize();

    assert.isNotOk(p.shouldPrerender(null));

    reasonToRejectLastPrerender = 'no-request';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if request is not an incoming message.', async () => {
    const p = new Prerenderer();
    await p.initialize();

    assert.isNotOk(p.shouldPrerender(123));

    reasonToRejectLastPrerender = 'rejected-request';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if it is not a GET request.', async () => {
    const p = new Prerenderer();
    await p.initialize();

    const r = await createDirectHttpPostRequest();
    assert.isNotOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = 'rejected-method';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if has empty user agent.', async () => {
    const p = new Prerenderer();
    await p.initialize();

    const r = await createDirectHttpGetRequest('', { 'user-agent': ''}, false);
    assert.isNotOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = 'no-user-agent';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if it is not a bot user agent.', async () => {
    const p = new Prerenderer();
    await p.initialize();

    const r = await createDirectHttpGetRequest('', {}, false);
    assert.isNotOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = 'rejected-user-agent';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if it is not a prerenderable extension.', async () => {
    /**
     * @type {import('../../../../dist/types/config/defaults').PrerendererConfigParams}
     */
    const config = {
      ...initialConfig,
      prerenderableExtensions: ['', '.html'],
    };

    const p = new Prerenderer(config);
    await p.initialize();

    const r = await createDirectHttpGetRequest('/pixel.png', {}, true);
    assert.isNotOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = 'rejected-extension';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should not prerender if it is not a prerenderable path.', async () => {
    /**
     * @type {import('../../../../dist/types/config/defaults').PrerendererConfigParams}
     */
    const config = {
      ...initialConfig,
      prerenderablePathRegExps: [/nonexistingpath/],
    };

    const p = new Prerenderer(config);
    await p.initialize();

    const r = await createDirectHttpGetRequest('/', {}, true);
    assert.isNotOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = 'rejected-path';
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });

  it('should prerender if it is a prerenderable path.', async () => {
    /**
     * @type {import('../../../../dist/types/config/defaults').PrerendererConfigParams}
     */
    const config = {
      ...initialConfig,
      prerenderablePathRegExps: [/index\.html/],
    };

    const p = new Prerenderer(config);
    await p.initialize();

    const r = await createDirectHttpGetRequest('/index.html', {}, true);
    assert.isOk(p.shouldPrerender(r));

    reasonToRejectLastPrerender = undefined;
    assert.equal(p.getLastRejectedPrerenderReason(), reasonToRejectLastPrerender);
  });
});