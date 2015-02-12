var fs = require("fs");

var util = exports;

util.expandPath = expandPath;
util.getUserHome = getUserHome;

/**
 * Returns path to user's home
 * @returns {string}
 */
function getUserHome() {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

/**
 * Expand the given path and create directories if they don't exist
 * @param path
 * @returns {boolean}
 */
function expandPath(path) {

    var path = path.replace('~', util.getUserHome());

    return path;
}