#!/usr/bin/env node
var _ = require('lodash');
var debug = require('debug')('bin:queueOPush');
var moment = require('moment');
var nconf = require('nconf');

var mongo = require('../lib/mongo');
var sites = require('../lib/sites');
var queue = require('../lib/queue');

nconf.argv().env().file({ file: 'config/storyteller.json' });

debug("Welcome to the queue opportunistic pusher");
var campaign = nconf.get('campaign');
if(campaign)
    debug("- campaign is set as %s", campaign);
else
    debug("- campaign not set: unfiltered query");

debug("First step: looking in `sites` table");

var accepted = [ "basic", "badger", "urlscan" ];
var testkind = nconf.get('kind');
if(!testkind) {
    testkind = [ "basic" ];
    debug("- kind not set: only `basic` (PhantomJS)");
} else {
    if(accepted.indexOf(testkind) === -1) {
        console.log("Error, you requested an invalid --kind", testkind, "accepted:", accepted);
        process.exit(1);
    }
    debug("SORRY! in this moment option [basic] is hardcoded, fix the code below");
    testkind = [ testkind ];
}

var filter = campaign ? { campaign: campaign } : {};

return mongo
    .read('sites', filter)
    .reduce(sites.frequencyExpired, [])
    .tap(function(sites) {
        debug("%d sites appears to need be analyzed", _.size(sites));
        var stats = _.countBy(sites, 'campaign');
        debug("Statistics: %s", JSON.stringify(stats, undefined, 2));
    })
    .map(function(site, n) {

        var description = _
            .compact([ site.website, site.address, site.kind, site.name ])
            .join(' ');
        return queue
            .buildDirective('basic', undefined, site.href, site.campaign, description, n);
    })
    .then(queue.add)
    .tap(queue.report);
