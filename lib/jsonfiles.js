var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs'),
    debug = require('debug')('lib.jsonfiles'),
    moment = require('moment');

Promise.promisifyAll(fs);

var theTarget = function(urlObject) {
    return _.find(urlObject._ls_links, function(u) {
        return u.type == "target";
    });
};

var theNotTarget = function(urlObject) {
    return _.filter(urlObject._ls_links, function(u) {
        return u.type != "target";
    });
};

var fileStruct = function(location, fname) {
    return {
        dom: location + fname + '.html',
        timeout: location +  fname +".timeout",
        render: location +  fname +'.jpeg',
        io: location +  fname +'.json',
        text: location +  fname +'.txt',
        headers: location +  fname +'.head'
    };
};

var directoryStruct = function(links, diskPath) {
    /* why isn't working the targetHref in this way ?
    _.find(links, function(u) { return u.type == "target"; }), */
    diskPath = (_.endsWith(diskPath, "/")) ? diskPath : diskPath + "/";

    var timeString = moment().format('YYMMDD'),
        targetHref = links[0],
        shortHash = _.trunc(targetHref._ls_id_hash, { length: 6, omission: '' }),
        host = targetHref.host,
        location = diskPath + timeString + "/" + host + "/" + shortHash + "/";

    return {
        timeString: timeString,
        location: location
    };
};

module.exports = {
    directoryStruct: directoryStruct,
    fileStruct: fileStruct
};