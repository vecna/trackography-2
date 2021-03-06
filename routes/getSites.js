var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug')('route:getSites');
var moment = require('moment');
var nconf = require('nconf');

var mongo = require('../lib/mongo');
 
function getSites(req) {

    var filter = { campaign: req.params.campaign };
    var stripFields = ['_id', 'lastSurfId', 'lastChecked', 'frequency' ];

    debug("getSites filter %j", filter);

    return mongo
        .read(nconf.get('schema').sites, filter)
        .map(function(s) {
            return _.omit(s, stripFields);
        })
        .then(function(sites) {
            debug("getSites returns: %d", _.size(sites));
            return {
                'json': sites
            }
        });
};

module.exports = getSites;
