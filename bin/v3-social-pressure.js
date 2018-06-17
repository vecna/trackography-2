#!/usr/bin/env nodejs
var express = require('express');
var app = express();
var server = require('http').Server(app);
var Promise = require('bluebird');
var _ = require('lodash');
var moment = require('moment');
var debug = require('debug')('v2-social-pressure');
var nconf = require('nconf');
var machetils = require('../lib/machetils');

var defaultCfg = "config/v3-social-pressure.json";
nconf.argv().env();
var cfgFile = nconf.get('config') || defaultCfg;

nconf.argv()
     .env()
     .file('config', cfgFile);

var campaign = nconf.get('campaign');
if(_.isUndefined(campaign) || campaign === "overwritewithenvorcommandline")
    machetils.fatalError("MISSING: campaign environment variable");

var campaignc = 'campaigns/' + campaign + "/config/" + campaign + ".json";
debug("Loading as campaign config: %s", campaignc);

nconf.argv()
     .env()
     .file('campaign', campaignc)
     .file('config', cfgFile);

/* initialize libraries and inclusion only if the `campaign` variable set */
var routes = require('../routes/_v3socialpressure');
var dispatchPromise = require('../lib/dispatchPromise');

/* test, is "port" is not found, then campaign is not found too */
if(!nconf.get('port')) {
    console.error("Probabily the campaign suggested has not the settings file");
    console.error("campaigns/"+ campaign + ".json is required");
    console.error("check in campaigns/README.md the format");
    machetils.fatalError("missing configuration (port)");
}


/* everything begin here, welcome */
server.listen(nconf.get('port'), nconf.get('interface') );
console.log( "http://" + nconf.get('interface') + ':' + nconf.get('port') + " listening");

/* ------------------------------------------------------------ */
var paths = process.env.PWD.split('/');
paths.push('dist');
var distPath = paths.join('/');

app.get('/favicon.ico', function(req, res) {
	res.sendFile(distPath + '/favicon.ico');
});
app.get('/robots.txt', function(req, res) {
    res.sendFile(distPath + '/robots.txt');
});

app.use('/css', express.static(distPath + '/css'));
app.use('/lib', express.static(distPath + '/lib'));
app.use('/fonts', express.static(distPath + '/fonts'));
app.use('/images', express.static(distPath + '/images'));

/* development: the local JS are pick w/out "npm run build" every time */
if(nconf.get('development') === 'true') {
	var scriptPath = '/../sections/webscripts';
	console.log("ઉ DEVELOPMENT = serving JS from", distPath + scriptPath);
	app.use('/js/local', express.static(distPath + scriptPath));
} else {
	app.use('/js/local', express.static(distPath + '/js/local'));
}
app.use('/js/vendor', express.static(distPath + '/js/vendor'));
app.use('/campaign', express.static(distPath + '/../campaigns/' + campaign + '/web-accessible'));

app.get('/api/v:version/tasks/:cname', function(req, res) {
    return dispatchPromise('getCampaignPromises', routes, req, res);
});

/* This render the monoPage campaign */
var monoPage = require('../campaigns/' + campaign + '/page/controller.js');
app.get('/', function(req, res) {
    debugger;
    return new Promise
        .resolve(monoPage(req))
        .then(function(httpresult) {
            debug("serving /");
            debugger;
            res.send(httpresult.text)
        });
});