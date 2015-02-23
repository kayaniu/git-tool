#! /usr/bin/env node
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
    ,git = require('./git-utils/git-utils')
    ,parseArgs = require('minimist');

var ops = {checkout: 'checkout', pull:'pull', fetch:'fetch', status:'status', stash: 'stash'};

var argv = parseArgs(process.argv.slice(2), {boolean:['select', 'help']});
console.log(argv);
var wd = process.cwd();


main(wd, argv);

function main(workingDir, argv){

    if (argv.help){
        showHelp();
        return;
    }

    if (!validateArgs(argv)) {
        console.log('Invalid arguments');
        showHelp();
        return;
    }

    var op = argv._[0];
    var config = {workingDir: workingDir,
            argv: argv,
            condition: git.isGitRepository,
            options: null};

    if (op.toLowerCase() == ops.pull){

       config.operation = pull;
       command(config);
    }
    else if (op.toLowerCase() == ops.checkout){

        // validation
        if (!('b' in argv)) {
            console.log('You must specify a branch name with the -b param');
            return;
        }

        config.options = {branch: argv.b};
        config.operation = checkout;

        command(config);
    }
    else if (op.toLowerCase() == ops.fetch){
        config.operation = fetch;
        command(config);
    }
    else if (op.toLowerCase() == ops.status){
        config.operation = status;
        command(config);
    }
    else if (op.toLowerCase() == ops.stash){
        config.operation = stash;
        if ('a' in argv) config.options = {action: argv.a.toLowerCase()};
        command(config);
    }
    else {
        console.log('Invalid arguments');
        showHelp();
    }
}


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
            console.log("Could not retrieve directories");
            return;
        }

        if (folders.length == 0){
            console.log('No repositories found.');
            return;
        }

        // make sure they want to select, also make sure there are enough directories to make selection useful
        if (select && folders.length > 1){
            filterDirectories("Repositories", folders, handler);
        }
        else {
            handler(folders);
        }

    });
}

/**
 * Do a sanity check on the args
 * @param argv
 * @returns {boolean}
 */
function validateArgs(argv){

    return argv._.length != 1 ? false : true;
}


function showHelp(){
    console.log('usage: [operation] [params] [--select]');
    console.log('operations:');
    console.log('\tpull');
    console.log('\tcheckout');
    console.log('params:');
    console.log('\t-b branchname');
    console.log('--select - use this flag to select which folders to operate on');
    console.log('Examples:');
    console.log('To do a git pull op on selected folders');
    console.log('git-tool pull --select');
    console.log('To do a git checkout on selected folders');
    console.log('git-tool checkout -b release/test --select');
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
 * @param name
 * @param folders
 * @param callback
 */
function filterDirectories(name, folders, callback){

    // transform into a format appropriate for inquirer
    var choices = _.transform(folders, function(result, o){
        result.push({name: o.name, value: o.path});
    });


    inquirer.prompt([
        {
            type: "checkbox",
            message: "Select " + name,
            name: name,
            choices: choices,
            validate: function(answer){
                if (answer.length < 1){
                    return "You must choose at least one.";
                }

                return true;
            }
        }
    ], function(answers){

        var paths = answers[name];
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

/**
 * Execute an action on each selected folder
 * @param selection
 */
function handleSelection(selection, action, options){

    selection.forEach(function(o){
        console.log("Operating on " + o.name);
        action(o.path, options, function(err, command, stdout){
            if (err !== null) {;
                console.log("Failed to execute command " + command + " on " + o.name);
                console.log(err);
                return;
            }
            console.log("Executed " + command + " on " + o.name);
            console.log(stdout);
        });
    });

}

