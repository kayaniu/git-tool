/*
 * git-stash
 * https://github.com/kayaniu/git-stash
 *
 * Copyright (c) 2015, Umair Kayani
 * Licensed under the MIT license.
 */

'use strict';

/*

 * Module Dependencies
 */

require('colors');


module.exports = {
    error: function error(msg){
        output(msg, 'error');
    },
    warning: function warning(msg){
        output(msg, 'warning');
    },
    info: function info(msg){
        output(msg, 'info');
    },
    success: function success(msg){
        output(msg, 'success');
    },
    help: function help(msg){
        output(msg, 'help');
    },
    message: function message(msg){
        output(msg, 'default');
    }
};


function output(msg, type) {
    switch (type) {
        case 'error':
            console.log();
            console.log(msg.bold.red);
            break;
        case 'warning':
            console.log();
            console.log(msg.bold.yellow);
            break;
        case 'info':
            console.log();
            console.log(msg.blue);
            break;
        case 'success':
            console.log();
            console.log(msg.green);
            break;
        case 'help':
            console.log(msg.yellow);
            break;
        default:
            console.log(msg);
            break;
    }
}