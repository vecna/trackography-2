var _ = require('lodash');
var debug = require('debug')('route:getPages');
var pug = require('pug');

var pugCompiler = function(filePrefix) {
    return pug.compileFile(
        __dirname + '/../sections/' + filePrefix + '.pug', {
            pretty: true,
            debug: false
        }
    );
};

var pageMap = {
    'storyteller': pugCompiler('storyteller'),
    'vigile': pugCompiler('vigile'),
    'graphs': pugCompiler('exposergraph'),
    'raw': pugCompiler('raw'),
    'exposer': pugCompiler('exposer'),
    'subject': pugCompiler('subject'),
    'last': pugCompiler('last'),
    'details': pugCompiler('details'),
    'stats': pugCompiler('stats'),
    'history': pugCompiler('history'),
    'longterm-stats': pugCompiler('longterm-stats'),
    'project-plan': pugCompiler('projectPlan'),
    'info': pugCompiler('info'),
    'report': pugCompiler('reportList'),
    '404': pugCompiler('404'),
    'final-report': pugCompiler('finalreport'),
    'final-findings-latam-gobierno': pugCompiler('findings/latam-gobierno'),
    'final-findings-clinics': pugCompiler('findings/clinics'),
    'final-findings-elections': pugCompiler('findings/elections'),
    'imgs': pugCompiler('findings/alltheimgs')
};

var getPage = function(req) {

    var pageName = _.get(req.params, 'page');

    if(_.isUndefined(_.get(pageMap, pageName))) {
        debug("%s getPage on %s: not found", req.randomUnicode, pageName);
        pageName = '404';
    } else {
        debug("%s getPage of %s", req.randomUnicode, pageName);
    }

    return { 'text': pageMap[pageName]() };
};

module.exports = getPage;
