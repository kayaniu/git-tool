/*
 * git-tool-uk
 * https://github.com/kayaniu/git-tool
 *
 * Copyright (c) 2015 Umair Kayani
 * Licensed under the MIT license.
 */

var fs = require('fs')
    ,p = require('path')
    ,inquirer = require('inquirer')
    ,_ = require('lodash')
    ,message = require('./util/debugger')
    ,git = require('./git-utils/git-utils');


var cmd = exports;

cmd.command = command;

cmd.helper = {};
cmd.helper.getDirectories = getDirectories;
cmd.helper.filterDirectories = filterDirectories;

cmd.conditions = {};
cmd.conditions.isGitRepository = git.isGitRepository;

cmd.handlers = {};
cmd.handlers.pull = pull;
cmd.handlers.checkout = checkout;
cmd.handlers.push = push;
cmd.handlers.fetch = fetch;
cmd.handlers.stash = stash;
cmd.handlers.status = status;
cmd.handlers.branch = branch;

/**
 * Given a config object, run a command in the CL
 * @param config {workingDir:s, argv:o, condition:f, operation:f, options:(o | null)}
 * Properties:
 * workingDir: path of working directory
 * argv: object with command line arguments as properties
 * condition: a boolean function taking a (path) and returning if the folder/file is a match
 * operation: a function taking (folders, options) where folders is a list of folders, options (see below)
 * options: an object of options to pass to the operation which will be executed
 */
function command(config){

    var options = config.options;

    var select = config.argv.select;

    var handler = function handleFolder(folders){
        config.operation(folders, options);
    };

    getDirectories(config.workingDir, config.condition, function(err, folders){

        if (err !== null) {
            message.error("Could not retrieve directories");
            return;
        }

        if (folders.length == 0){
            message.error('No repositories found.');
            return;
        }

        // make sure they want to select, also make sure there are enough directories to make selection useful
        if (select && folders.length > 1){
            config.filter(folders, {name: "Repository"}, handler);
        }
        else {
            handler(folders);
        }

    });
}




/**
 * Given a path and boolean operator accepting a path, returns a list of directories
 * which pass the boolean operator condition, calls the callback with the params (err, folders) where folders is a list
 * of folder objects {name: name, path: somepath}
 * @param path
 * @param condition
 * @param callback
 */
function getDirectories(path, condition, callback){

    fs.readdir(path, function(err, files){

        if (err !== null){
            callback(err);
            return;
        }

        var folders = [];

        for (var i in files){

            var fname = files[i];
            var filePath = p.join(path, fname);

            if (condition(filePath)) folders.push({name: fname, path: filePath});
        }

        callback(null, folders);
    });

}

/**
 * Given a name and list of folders, present a command line prompt to filter the list
 * A callback is called once the user has selected folders, with params (folders) which is a list of filtered/selected
 * folders
 * @param folders
 * @param options  - must contain a name property
 * @param callback
 */
function filterDirectories(folders, options, callback){

    // transform into a format appropriate for inquirer
    var choices = _.transform(folders, function(result, o){
        result.push({name: o.name, value: o.path});
    });


    inquirer.prompt([
        {
            type: "checkbox",
            message: "Select " + options.name,
            name: options.name,
            choices: choices,
            validate: function(answer){
                if (answer.length < 1){
                    return "You must choose at least one.";
                }

                return true;
            }
        }
    ], function(answers){

        var paths = answers[options.name];
        var filteredFolders = folders.filter(function(el){
            if (paths.indexOf(el.path) >= 0) return true;
        });

        callback(filteredFolders);

    });
}

function pull(selection, options){
    handleSelection(selection, git.pull, options);
}

function checkout(selection, options){
    handleSelection(selection, git.checkout, options);
}

function fetch(selection, options){
    handleSelection(selection, git.fetch, options);
}

function status(selection, options){
    handleSelection(selection, git.status, options);
}

function stash(selection, options){
    handleSelection(selection, git.stash, options);
}

function branch(selection, options){
    handleSelection(selection, git.branch, options);
}

function push(selection, options){
    handleSelection(selection, git.push, options);
}

/**
 * Execute an action on each selected folder
 * @param selection
 */
function handleSelection(selection, action, options){

    selection.forEach(function(o){
        message.message("Operating on " + o.name);
        action(o.path, options, function(err, command, stdout){
            if (err !== null) {;
                message.error("Failed to execute command " + command + " on " + o.name);
                message.message(err);
                return;
            }
            message.success("Executed " + command + " on " + o.name);
            message.message(stdout);
        });
    });

}

