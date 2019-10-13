# Pluggable SPA Prerenderer for SEO

[![Build Status](https://travis-ci.org/duartealexf/spa-seo-prerenderer.svg?branch=master)](https://travis-ci.org/duartealexf/spa-seo-prerenderer)
[![npm](https://img.shields.io/npm/v/spa-seo-prerenderer.svg)](https://img.shields.io/npm/v/spa-seo-prerenderer.svg)
[![node](https://img.shields.io/node/v/spa-seo-prerenderer.svg)](https://img.shields.io/node/v/spa-seo-prerenderer.svg)
[![license](https://img.shields.io/npm/l/spa-seo-prerenderer.svg)](https://img.shields.io/npm/l/spa-seo-prerenderer.svg)

**Make your SPA's SEO-friendly and crawlable.**

- Host it yourself - no paid services involved.
- Quickly deliver snapshots of pages to bots and crawlers.
- Fully configurable whitelists, blacklists, cache age, bot list, etc.
- Delivery proper 40x status by adding status to meta-tags (no more soft 404, avoid duplicate content).
- Snapshots are stored in MongoDB - fast snapshot querying and delivering.
- Tag snapshots by route and path patterns to automatically flag them to recache (WIP).
- Plenty of recipes to use with Apache, Nginx and NodeJS, with or without Docker.
- Fully tested, test-driven developed with ❤️.

---

- [Getting started](#getting-started)
- [Configurable features](#configurable-features)
  - [`databaseOptions` (MongoDB connection)](#databaseoptions-mongodb-connection)
  - [`cacheMaxAge` (Max age for snapshots)](#cachemaxage-max-age-for-snapshots)
  - [`ignoredQueryParameters` (Ignored query parameters)](#ignoredqueryparameters-ignored-query-parameters)
  - [`prerenderablePathRegExps` (Prerenderable paths RegExp array)](#prerenderablepathregexps-prerenderable-paths-regexp-array)
  - [`prerenderableExtensions` (Prerenderable extensions)](#prerenderableextensions-prerenderable-extensions)
  - [`botUserAgents` (Bot user-agent list)](#botuseragents-bot-user-agent-list)
  - [`timeout` (Puppeteer timeout)](#timeout-puppeteer-timeout)
  - [`whitelistedRequestURLs` (Whitelisted request URLs)](#whitelistedrequesturls-whitelisted-request-urls)
  - [`blacklistedRequestURLs` (Blacklisted request URLs)](#blacklistedrequesturls-blacklisted-request-urls)
  - [Custom status code](#custom-status-code)
  - [Snapshot tagging (*work in progress*)](#snapshot-tagging-work-in-progress)
- [Motivation](#motivation)
- [This project vs other services](#this-project-vs-other-services)
  - [Cloud prerender services](#cloud-prerender-services)
  - [Other projects](#other-projects)
- [Contributing](#contributing)
  - [Commiting](#commiting)
  - [IDE configuration: Visual Studio Code](#ide-configuration-visual-studio-code)

## Getting started

The Prerenderer runs as a service in NodeJS and uses Google's Puppeteer to prerender pages. It delivers the prerendered response and then caches the snapshot data in MongoDB.

Plug it [as a middleware](https://github.com/duartealexf/seo-prerenderer/blob/master/recipes/prerenderer-middleware). Serve directly from NodeJS or use it behind a proxy (Apache or Nginx). With or without docker. Take a look at the [recipes](https://github.com/duartealexf/seo-prerenderer/blob/master/recipes) available to better fit your use-case.

If you don't find the recipe you are looking for, please do create an issue or you are welcome to create a PR

Currently the Prerenderer only prerenders pages on-demand. It does not include a crawler to auto-refresh old cached pages (this and other features are in the [roadmap](https://github.com/duartealexf/seo-prerenderer/blob/master/ROADMAP.md)).

## Configurable features

The Prerenderer has optimal configuration by default, but you can always adjust them to better fit your needs. The `config` object should be provided when constructing the service via `new PrerendererService(config)`.

See keys and values for `config` below.

### `databaseOptions` (MongoDB connection)

The prerendered pages' cache (snapshots) are stored in a MongoDB database. The database connection options can be any of the [MongoDB NodeJS driver's options](https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options).

### `cacheMaxAge` (Max age for snapshots)

Default value: 7 days.

The amount of time after a cached snapshot is last saved, before it is considered old and need to be recached.

### `ignoredQueryParameters` (Ignored query parameters)

Default value: see `DEFAULT_IGNORED_QUERY_PARAMETERS` in [defaults file](https://github.com/duartealexf/seo-prerenderer/blob/master/src/config/defaults.ts).

Some query parameters need to be ignored, because they don't affect how the page is rendered. If your app has more query parameters than the default ones, simply extend this configuration.

### `prerenderablePathRegExps` (Prerenderable paths RegExp array)

Default value: `[new RegExp('.*')]` (all paths are prerenderable).

Override this option if you'd like to have a finer control of which routes are prerendered to bots.

> 📌 This option is only used when calling `prerendererService.getPrerenderer().shouldPrerender(request)` method. If you are using the Prerenderer behind a proxy, then probably Apache/Nginx decides whether request should be prerendered, so you would not need to worry about changing `prerenderablePathRegExps`. If this is the case, the prerenderable paths should be set in Apache (using `RewriteCond`) or Nginx (via `location` directive). See [recipes](https://github.com/duartealexf/spa-seo-prerenderer/tree/master/recipes) for more information.

### `prerenderableExtensions` (Prerenderable extensions)

Default value: see `DEFAULT_PRERENDERABLE_EXTENSIONS` in [defaults file](https://github.com/duartealexf/seo-prerenderer/blob/master/src/config/defaults.ts).

If any of these file extensions are in the request URI, then it is prerendered to bots.

> 📌 This option is only used when calling `prerendererService.getPrerenderer().shouldPrerender(request)` method. If you are using the Prerenderer behind a proxy, then probably Apache/Nginx decides whether request should be prerendered, so you would not need to worry about changing `prerenderableExtensions`. If this is the case, the prerenderable extesions should be set in Apache/Nginx config. See [recipes](https://github.com/duartealexf/spa-seo-prerenderer/tree/master/recipes) for more information.

### `botUserAgents` (Bot user-agent list)

Default value: see `DEFAULT_BOT_USER_AGENTS` in [defaults file](https://github.com/duartealexf/seo-prerenderer/blob/master/src/config/defaults.ts).

A list of case-insensitive substrings of user-agents. If the request user-agent is any of these, then the service will consider prerendering.

> 📌 This option is only used when calling `prerendererService.getPrerenderer().shouldPrerender(request)` method. If you are using the Prerenderer behind a proxy, then probably Apache/Nginx decides whether request should be prerendered, so you would not need to worry about changing `botUserAgents`. If this is the case, the bot user-agents should be set in Apache/Nginx config. See [recipes](https://github.com/duartealexf/spa-seo-prerenderer/tree/master/recipes) for more information.

### `timeout` (Puppeteer timeout)

Default value: `10` (seconds).

Time to wait for receving page response when prerendering, before considering error 500.

### `whitelistedRequestURLs` (Whitelisted request URLs)

Default value: empty array.

Case insensitive list with URL substrings that Puppeteer will allow the prerendering page to make network requests to (e.g. resources).

If a part of the page only renders under some sort of A/B test, you might want to whitelist the host of the A/B test provider (e.g. by whitelisting `googletagmanager.com`).

> 💡 It also makes sense to use this when setting the blacklist to all URLs, and specify which specific URLs to allow. Only do this if you are sure which URLs your pages make requests to.

### `blacklistedRequestURLs` (Blacklisted request URLs)

Default value: see `DEFAULT_BLACKLISTED_REQUEST_URLS` in [defaults file](https://github.com/duartealexf/seo-prerenderer/blob/master/src/config/defaults.ts).

Case insensitive list with URL substrings that Puppeteer will disallow the prerendering page to make requests to.

Useful for disallowing the prerendered page to make network requests to, services like Google Analytics, GTM, chat services, Facebook, etc.

> 💡 When used alongside the whitelist, it is useful to blacklist all URLs, but only do this if you are sure which URLs your pages make requests to – in this case, you can ignore all URLs by setting blacklist to `['.']`.

### Custom status code

One of the most important features to take advantage of.

Add a `<meta name="prerenderer:status" content="XXX">` meta-tag to your page if you'd like to deliver a custom status (replace XXX with the HTTP status code you'd like to deliver with the prerendered response).

> 💡 **Example:** Let's say you have several routes configured for your SPA, but you have one last catch-all route to deliver a 404 user-friendly "not found" message.
>
> The problem with this is that, even though it is a "not found" page, the delivered HTTP status code is 200. This is what Google calls a soft-404 and it's a very penalizing issue. Depending on the scenario, it can also consider it as duplicate content without canonical - another problematic situation.
>
> Avoid these problems by programatically adding the meta-tag to the head of your 404 page, and the Prerenderer will look for it. It will deliver the correct status code alongside the user-friendly 404 message. Everyone's happy.

### Snapshot tagging (*work in progress*)

Perhaps the most powerful feature in this project. Snapshot tagging allows you to invalidate all cached prerendered pages in database so that code changes take effect immediately, following a release.

> 💡 **Example:** Let's say you host an ecommerce and use this Prerenderer.
>
> After a version release, you change the product page layout and would like to start serving to bots the new layout as soon as possible. You can configure the Prerenderer by naming a `product` tag and map it to the path of product pages (e.g. `/product/*`).
>
> As soon as you release a new version, you can use Github Actions to detect changes to your product pages (via file changes, commit message, commit tagging, etc) and call your hosted Prerendered service's API - to invalidate existing product pages's cache, thus start serving the new version immediately.

---

## Motivation

I was just tired of having to create server-side-rendered pages whenever projects had something to do with SEO.

After having Puppeteer available to us, there are plenty of reasons to keep using tecnologies we love when creating SPAs, rather than having to use [isomorphic](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) approaches like [Next.js](https://nextjs.org) or the very-slow full-snapshot-rebuild-on-CI like [Gatbsy](https://www.gatsbyjs.org/). There's just too much workaround, like having to mirror the browser window with NodeJS (e.g. [node-fetch](https://www.npmjs.com/package/node-fetch)) or rehydrating a whole ReactJS app – what a mess!

Lastly, it's not long before bots and crawlers can actually "understand" javascript to crawl your site. It's the flip of a switch. And when they do it - if you rely on server-side-render (SSR), what are you going to do with all the effort you spent on SSR'ing? Think ahead, use the Prerenderer - when the bots flip the switch, you just unplug it. Zero effort.

## This project vs other services

### Cloud prerender services

There are online services that offer a perhaps-not-as-configurable prerendering service, like [Prerender.io](http://prerender.io) and [Prerender.cloud](https://www.prerender.cloud/).

Some of them require changing your app's code to configure the service, which is not optimal, but they are very good options if you can't host you own Prerenderer or don't want to worry about hosting one, and can pay for such service.

### Other projects

- [Rendertron](https://github.com/GoogleChrome/rendertron) - from Google, but not as configurable and has features you may not need (like screenshots) - also, not as pluggable nor it has a database to control cache or tagging.
- [bp-pre-puppeteer-node](https://github.com/brijeshpant83/bp-pre-puppeteer-node) - not as configurable, does not include a database to control cache or snapshot tagging, not as well tested as this project, and only works as a middleware.

## Contributing

You are welcome to contribute!

Preferably use npm, as all scripts in package.json are run through npm.

- Clone this repo
- Install dependencies: `npm i`

### Commiting

To commit, use commitizen: `git cz` (you will need to have installed commitizen: `npm i -g commitizen`).

### IDE configuration: Visual Studio Code

When opening the project in VSCode, install the extensions that the IDE will recommend. They are listed in `.vscode/extensions.json` file.

Make sure you run `npm i` to install devDependencies needed by the IDE.
