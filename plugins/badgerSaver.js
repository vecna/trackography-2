var _ = require('lodash');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var debug = require('debug')('plugin:badgerSaver');
var moment = require('moment');
var nconf = require('nconf');
var path = require('path');

var various = require('../lib/various');
var mongo = require('../lib/mongo');
var urlutils= require('../lib/urlutils');

function badgerFingerprint(memo, unclean, inclusionName) {

    var entry = {
        inclusion: inclusionName
    };

    _.each(unclean.counts, function(amount, jsfunction) {
        if(amount) {
            var k = _.replace(jsfunction, /\./g, '_');
            /* in mongo you can't save key with '.' */
            entry[k] = amount;
        }
    });

    memo.push(entry);
    return memo;
};

/* this function acquire the .json saved by badger-claw and create
 * a meaningful set of mongodb object, in the 'badger' table */
function saveBadger(gold, conf) {

    if(_.isUndefined(gold.badger)) {
        debug("badger has triggered an error, skipping");
        return false;
    }

    var sourcefile = path.join(gold.disk.incompath, 'badger-output.json');
    var needInfo = [ 'subjectId', 'href', 'needName' ];
    var core = _.pick(gold, needInfo);

    core.promiseId = gold.id;
    core.version = 1;
    core.VP = conf.VP;
    core.when = new Date(moment().toISOString());

    debug("using as input %s", sourcefile);

    return fs
        .readFileAsync(sourcefile, 'utf-8')
        .then(JSON.parse)
        .then(function(content) {

            var cc = _.reduce(content.fingerprint, badgerFingerprint, []);
            /* ioByPeer has key as the phantom.id increment numb */
            return _.map(cc, function(value) {
                return _.extend(value, core);
            });
        })
        .then(function(data) {
            console.log(JSON.stringify(data, undefined, 5));
            debug("Saving %d keys/value in .badger (%s promiseId)",
                _.size(data), data[0].promiseId);
            return mongo.writeMany(nconf.get('schema').badger, data);
        })
        .return(true)
        .catch(function(error) {
            debug("Exception managed! %s -- not written db any entry for promiseId %s",
                    error, core.promisedId);
            return false;
        });
};

module.exports = function(val, conf) {

    /* indepotent function saver is */
    return saveBadger(val, conf).return(val);
}
