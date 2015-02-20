var fs = require('fs');
var exec = require('child_process').exec;

var utils = exports;

utils.pull = function pull(path, options, callback){
    folderAction(path, 'git pull', callback);
};

utils.checkout = function checkout(path, options, callback){
    folderAction(path, 'git checkout ' + options.branch, callback);
};

utils.push = function push(path, options, callback){
    folderAction(path, 'git push', callback);
};

utils.fetch = function fetch(path, options, callback){
    folderAction(path, 'git fetch', callback);
};

utils.isGitRepository = isGitRepo;

function folderAction(path, command, callback){

    var child = exec(command, {cwd: path, encoding: 'utf8'}, function(error, stdout, stderr){

        var err = null;

        if (error !== null) {
            err = "error occurred while running command: " + command;
            if (stderr){
                err += " debug: " + stderr;
            }
        }

        callback(err, command, stdout);
    });
}

/**
 * Test if a given path is a git repository
 * @param path
 * @param fileSystem
 * @returns {boolean}
 */
function isGitRepo(path){


    var stats = fs.statSync(path);


    if (stats.isFile()) return false;

    var dirFiles = fs.readdirSync(path);

    if (dirFiles.indexOf(".git") >= 0){
        return true;
    }

    return false;
}