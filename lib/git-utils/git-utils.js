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

utils.status = function status(path, options, callback){
    folderAction(path, 'git status', callback);
};

utils.stash = function stash(path, options, callback){

    var command = 'git stash';
    var action = "";

    if (options != null){
        if (options.action == 'apply') action += " apply";
        if (options.action == 'list') action += " list";
        if (options.action == 'pop') action += " pop";
        if (options.action == 'drop') action += " drop";
    }


    folderAction(path, command + action, callback);
};

utils.branch = function branch(path, options, callback){
    folderAction(path, 'git branch', callback);
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