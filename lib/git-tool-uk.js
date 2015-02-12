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

var wd = process.cwd();

var config =
    {host: "test",
    https: true,
    ssh: "git"};

var user = {name: 'ukayani', password: 'test'};

var stashClone = sc.create(config, user);

stashClone.getProjects(function(error, projects){
    if (error) {
        console.error(error);
        return;
    }

    projects.forEach(function(e){
        console.log(e);
    });

    stashClone.getRepositories("ATG2", function(error, repos){
        if (error) {
            console.error(error);
            return;
        }

        repos.forEach(function(e){
            console.log(e);
        });
    });

});

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
 *
 * @param path
 */
function pull(path){
    var exec = require('child_process').exec;

    var child = exec('git pull', {cwd: path, encoding: 'utf8'}, function(error, stdout, stderr){

        if (error !== null) {
            console.log('error occurred while trying to pull: ' + path);
            return;
        }

        console.log('git pull of ' + path);
        console.log(stdout);
        console.log(stderr);
    });
}

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

/**
 * Test if a given path is a git repository
 * @param path
 * @param fileSystem
 * @returns {boolean}
 */
function isGitRepo(path, fileSystem){

    var stats = fileSystem.statSync(path);

    if (stats.isFile()) return false;

    var dirFiles = fileSystem.readdirSync(path);

    if (dirFiles.indexOf(".git") >= 0){
        return true;
    }

    return false;
}