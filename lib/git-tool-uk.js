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

function filterDirectories(name, folders, callback){

    var choices = _.transform(folders, function(result, o){
        result.push({name: o.name, value: o.path});
    });//transform

    inquirer.prompt([
        {
            type: "checkbox",
            message: "Select " + name,
            name: name,
            choices: choices,
            validate: function(answer){
                if (answer.length < 1){
                    return "You must choose at least one repository.";
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


/*
fs.readdir(wd, function(err, files){
    var choices = [];

    for (var i in files){

        var fname = files[i];
        var path = p.join(wd, fname);

        if (isGitRepo(path, fs)) choices.push({name: fname, value: path});

    }

    if (choices.length == 0) return;
    if (choices.length == 1){
        var selection = {folders: _.transform(choices, function(result, o){
            return result.push(o.value);
        })};

        handleSelection(selection);
        return;
    }

    selectChoices(choices, handleSelection);

});
*/



/**
 * Present a prompt to user to make a selection out of the provided choices
 * @param choices
 * @param callback - called when user is done selecting with a list of answers as a param
 */
function selectChoices(choices, callback){

    inquirer.prompt([
        {
            type: "checkbox",
            message: "Select Repositories",
            name: "folders",
            choices: choices,
            validate: function(answer){
                if (answer.length < 1){
                    return "You must choose at least one repository.";
                }

                return true;
            }
        }
    ], function(answers){
        callback(answers);
    });
}

/**
 * Execute an action on each selected folder
 * @param selection
 */
function handleSelection(selection, action){

    var items = selection.folders;
    for (var i in items){
        action(items[i]);
    }
}

