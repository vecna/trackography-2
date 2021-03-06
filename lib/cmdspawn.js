var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug')('lib:cmdspawn');
var spawn = require('child_process').spawn;

function commandWithoutTimeout(command) {

    return new Promise(function(resolve, reject) {

        var M = spawn(command.binary,
                      command.args,
                    { env: command.environment } );

        M.stdout.on('data', function(data) {
            debug("Output: %s", data);
        });

        M.stderr.on('data', function(data) {
            debug("Error: %s", data);
        });

        M.on('close', (code) => {
            debug("Command (%s) exited with code %d", command.binary, code);
            return resolve();
        });

        M.on('exit', function(code) {
            if (code && code.error) {
                debug("Exit (with Error) %j", code);
                return reject();
            } else {
                return resolve();
            }
        });
    })
};

var spawnCommand = function(command, msTimeout) {

    if(!msTimeout) {
        debug("Executing %s -- without timeout from %s",
            JSON.stringify(command, undefined, 1),
            process.cwd()
        );

        return commandWithoutTimeout(command);
    } else if(_.isUndefined(msTimeout))
        msTimeout = 1000;

    debug("Executing [%s %s] [max ms %d] from %s",
        command.binary, command.args, msTimeout, process.cwd()
    );

    return commandWithoutTimeout(command)
        .timeout(msTimeout);
};

module.exports = spawnCommand;
