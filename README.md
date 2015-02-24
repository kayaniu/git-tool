# git-tool-uk

Tool for managing multiple git repo folders

## Getting Started
1. Clone the repository
2. Cd into root folder
3. Install the module with: `npm install`
4. Create sym-link for the tool, `npm link`


## Documentation
*Usage*: `git-tool [operation] [params] [--select]`

*operations*:
    > pull
    > checkout
      _params_: -b branchname
    > push
    > fetch
    > status
    > stash
      _params_: -a [pop|drop|list|apply]
    > branch
--select - use this flag to select which folders to operate on


Your git repositories must reside under a common parent
ex.

myrepos/
    ->repoA
    ->repoB
    ->repoC

To manage these repositories, use the git-tool command with your desired operation.


## Examples

To do a git pull operation on multiple repositories which are selected:
`git-tool pull --select`

To switch branch on all repositories in a folder to a release/gold branch:
`git-tool checkout -b 'release/gold'`

To retrieve the latest versioning information for selected repositories:
`git-tool fetch --select`

To stash changes on all repositories (possibly before switching branches):
`git-tool stash`

To apply changes from the latest stash for all repositories:
`git-tool stash -a apply`

To see the current branch for all repositories, as well as all the branches:
`git-tool branch`

Note: specify the --select flag if you wish to do the operation on a subset of repos within the folder you are running
the command.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 Umair Kayani  
Licensed under the MIT license.
