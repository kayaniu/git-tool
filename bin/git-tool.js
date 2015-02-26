#! /usr/bin/env node

var parseArgs = require('minimist')
    ,message = require('../lib/util/debugger')
    ,git = require('..');

var ops = {checkout: 'checkout', pull:'pull', fetch:'fetch', status:'status', stash: 'stash', branch: 'branch'};

var argv = parseArgs(process.argv.slice(2), {boolean:['select', 'help']});
var wd = process.cwd();

main(wd, argv);

function main(workingDir, argv){

    if (argv.help){
        showHelp();
        return;
    }

    if (!validateArgs(argv)) {
        message.error('Invalid arguments');
        showHelp();
        return;
    }

    var op = argv._[0];

    var config = {
        workingDir: workingDir,
        argv: argv,
        condition: git.conditions.isGitRepository,
        filter: git.helper.filterDirectories,
        options: null
    };

    if (op.toLowerCase() == ops.pull){

        config.operation = git.handlers.pull;
        git.command(config);
    }
    else if (op.toLowerCase() == ops.checkout){

        // validation
        if (!('b' in argv)) {
            message.error('You must specify a branch name with the -b param');
            return;
        }

        config.options = {branch: argv.b};
        config.operation = git.handlers.checkout;

        git.command(config);
    }
    else if (op.toLowerCase() == ops.fetch){
        config.operation = git.handlers.fetch;
        git.command(config);
    }
    else if (op.toLowerCase() == ops.status){
        config.operation = git.handlers.status;
        git.command(config);
    }
    else if (op.toLowerCase() == ops.stash){
        config.operation = git.handlers.stash;
        if ('a' in argv) config.options = {action: argv.a.toLowerCase()};
        git.command(config);
    }
    else if (op.toLowerCase() == ops.branch){
        config.operation = git.handlers.branch;
        git.command(config);
    }
    else {
        message.error('Invalid arguments');
        showHelp();
    }
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
    message.info('usage: [operation] [params] [--select]');
    message.message('operations:');
    message.message('\tpull');
    message.message('\tcheckout');
    message.message('\t params:');
    message.message('\t\t-b branchname');
    message.message('\tpush');
    message.message('\tfetch');
    message.message('\tstatus');
    message.message('\tstash');
    message.message('\t params:');
    message.message('\t\t-a [pop|drop|list|apply]');
    message.message('\tbranch');

    message.message('--select - use this flag to select which folders to operate on');
    message.help('Examples:');
    message.help('To do a git pull op on selected folders');
    message.message('git-tool pull --select');
    message.help('To do a git checkout on selected folders');
    message.message('git-tool checkout -b release/test --select');
}