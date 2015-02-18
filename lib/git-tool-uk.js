#! /usr/bin/env node
/*
 * git-tool-uk
 * https://github.com/kayaniu/git-tool
 *
 * Copyright (c) 2015 Umair Kayani
 * Licensed under the MIT license.
 */

var fs = require('fs');
var p = require('path');
var inquirer = require('inquirer');
var _ = require('lodash');
var fsUtils = require('./util/filesystem');
var mkdirp = require('mkdirp');
var sc = require('./stash-clone/stash-clone');
var git = require('./git-utils/git-utils');

var wd = process.cwd();

var config =
    {host: "test",
    https: true,
    ssh: "git"};

var user = {name: 'ukayani', password: 'test'};

var stashClone = sc.create(config, user);

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

            if (condition(filePath)) folders.push({name: fname, path: path});
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

        var paths = _.transform(answers[name], function(result, o){
            result.push(o);
        });

        callback(paths);

    });
}

function pull(selection, options){
    handleSelection(selection, git.pull, options);
}

function checkout(selection, options){
    handleSelection(selection, git.checkout, options);
}

/**
 * Execute an action on each selected folder
 * @param selection
 */
function handleSelection(selection, action, options){

    for (var i in selection){
        action(selection[i], options, function(err, command, stdout){
            if (err == null) {
                console.log("Failed to execute command " + command + " on " + selection[i]);
                return;
            }
            console.log("Running " + command + " on " + selection[i]);
            console.log(stdout);
        });
    }
}

