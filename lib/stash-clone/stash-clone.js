// Deps
var rest = require("restler");
var async = require("async");
var childProcess = require('child_process');

var sc = exports;

/**
 * Return an instance of a stashClone object, to do operations with stash
 * @param config
 * @param user
 * @returns {stashClone}
 */
sc.create = function create(config, user){
    return new stashClone(config, user);
};

/**
 * Constructor for stashClone
 * @param config - config object should have a https boolean, host and ssh property
 * @param user - user object, should have a name property and a password property
 */
function stashClone(config, user){
    this.config = config;
    this.user = user;

    var rootUrl = config.https ? 'https' + '://' + config.host + '/rest/api/1.0/' : 'http' + '://' + config.host + '/rest/api/1.0/';
    this.endpoints = {
        projects: rootUrl + 'projects'
    };

    console.log("host " + config.host);
    console.log(rootUrl);
}

stashClone.prototype.getProjects = getProjects;
stashClone.prototype.getRepositories = getRepos;
stashClone.prototype.cloneRepositories = cloneRepos;

/**
 * Given a list of repos and a project key, clone all the repositories in current working directory
 * @param repos
 * @param projectKey
 * @param options - accepts a property 'cwd' for working directory, in case you need to change it
 */
function cloneRepos(repos, projectKey, options) {
  var self = this;
  // Clone each repo
  repos.forEach(function(e) {
    if(self.config.ssh) {
      var cloneUrl = [
          'ssh:/',
          self.config.ssh + '@' + self.config.host,
          projectKey,
          e.name + '.git'
      ].join('/');
    } else {
      cloneUrl = e.clone;
    }
    // Clone project
    cloneRepo(cloneUrl, options);
  });
}

/**
 * Clones a single repository
 * @param cloneUrl
 * @param options - accepts a property 'cwd' for working directory
 */
function cloneRepo(cloneUrl, options) {
  console.log('git clone ' + cloneUrl);

  var options = options || {};

  var cloner = childProcess.exec('git clone ' + cloneUrl, options, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: '+ error.code);
      console.log('Signal received: '+ error.signal);
    }
    console.log(stdout);
  });
}

/**
 * Given a project key, retrieves a list of repos under that project in stash
 * @param project_key
 * @param callback - called with params (error, repos) on completion/error
 */
function getRepos(project_key, callback) {

  var self = this;

  // A doWhilst helps us deal with the paged results from stash
  var repos = [];
  var lastData = {};
  async.doWhilst(
    // Do func
    function(next) {
      rest.get(self.endpoints.projects + '/' + project_key + '/repos', {
          username: self.user.name,
          password: self.user.password,
          query: { start: lastData.start || 0 }
        })
        .on('error', callback)
        .on('complete', function(data) {
          if(data.errors) {
            return next(data.errors[0].message);
          }

          // Consolidate into projects array
          for (var i = 0, j = data.values.length; i < j; i++) {
            var elem = data.values[i];
            repos.push({
              name: elem.name,
              clone: elem.cloneUrl
            });
          }

          // Save the last response, so we know how to proceed in this loop
          lastData = {
            more: data.isLastPage === false ? true : false,
            start: data.nextPageStart
          };

          next();
        });
    },
    // While func
    function() {
      // Continue loop if the 'more' data flag is true
      return !!lastData.more;
    },
    // Finish func
    function(error) {
      callback(error, repos);
    });
}

/**
 * Returns a list of projects for stash repo/ user associated with current instance
 * @param callback - called with params (error, projects) on completion/error
 */
function getProjects(callback) {

  var self = this;

  // A doWhilst helps us deal with the paged results from stash
  var projects = [];
  var lastData = {};
  async.doWhilst(
    // Do func
    function(next) {
      rest.get(self.endpoints.projects, {
          username: self.user.name,
          password: self.user.password,
          query: { start: lastData.start || 0 }
        })
        .on('error', callback)
        .on('complete', function(data) {

          if(data.errors) {
            return next(data.errors[0].message);
          } else if (!data.values || !data.values.length) {
            return next('No results');
          }

          // Consolidate into projects array
          for (var i = 0, j = data.values.length; i < j; i++) {
            var elem = data.values[i];
            projects.push({
              id: elem.id,
              key: elem.key,
              name: elem.name,
              display: elem.key + ' (' + elem.name + ')'
            });
          }

          // Save the last response, so we know how to proceed in this loop
          lastData = {
            more: data.isLastPage === false ? true : false,
            start: data.nextPageStart
          };

          next();
        });
    },
    // While func
    function() {
      // Continue loop if the 'more' data flag is true
      return !!lastData.more;
    },
    // Finish func
    function(error) {
      callback(error, projects);
    });
}
