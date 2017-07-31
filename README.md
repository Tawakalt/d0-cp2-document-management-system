[![Build Status](https://travis-ci.org/Tawakalt/d0-cp2-document-management-system.svg?branch=master)](https://travis-ci.org/Tawakalt/d0-cp2-document-management-system)
[![Code Climate](https://codeclimate.com/github/Tawakalt/d0-cp2-document-management-system/badges/gpa.svg)](https://codeclimate.com/github/Tawakalt/d0-cp2-document-management-system)
[![Test Coverage](https://codeclimate.com/github/Tawakalt/d0-cp2-document-management-system/badges/coverage.svg)](https://codeclimate.com/github/Tawakalt/d0-cp2-document-management-system/coverage)

## A Document management System

- This repository contains a working solution to a document management system, complete with roles and privileges. Each document defines access rights; the document defines which roles can access it. Also, each document specifies the date it was published. Users are categorized by roles. Each user must have a role defined for them. 
- The application has the following features;
  signup
  Login/Logout
  Create Roles, Users and Documents
  Update Users and Documents
  Delete Users and Documents
  Search for Users and Documents
  
​
## Project Dependencies

# Dependencies
- babel-cli: Babel Command Line
- babel-core: Babel Core. It compiles es6 used in the app to es5
- babel-eslint: Custom Parser for ESlint
- babel-preset-es2015: Babel Preset for all ES2015 Plugins
- babel-preset-stage-2: Babel Preset for stage 2 plugins
- bcrypt: A bycrypt library for NodeJS
- body-parser: NodeJs body parsing middleware
- dotenv: Loads enviroment variables from .env file
- express: Fast, Unopinionated minimalistic web framework. Used as the web server for this application
- jsonwebtoken: JSON Web Token Implementation
- local-storage: A simplified localStorage API
- morgan: HHTP Request Logger Middleware for NodeJs
- pg: postreSQL Client
- pg-hstore: A module for serializing and deserializing JSON data into hstore format
- sequelize: Multi dialect ORM for NodeJS
- validator: A library of string validators and sanitizers.

​
# Development Dependencies
- chai: BDD/TDD Assertion Library for NodeJS and the web
- eslint: A syntax highlighter.
- eslint-config-airbnb-base: Airbnb's bade JS Eslint config.
- eslint-plugin-import: Supports linting of ES2015+ (ES6+) import/export syntax
- gulp: The streaming build system
- gulp-babel: Use next generation JavaScript, today, with Babel
- gulp-exit: Terminates Gulp task
- gulp-inject-modules: Loads Javascript files on demand from a gulp stream into Node's module Loader
- gulp-istanbul: Istanbul Unit Test Coverage Plugin for Gulp
- gulp-jasmine-node: Gulp task for Jasmine node modules
- gulp-nodemon: Gulp + nodemon
- mocha: Test framework
- nodemon: A simple monitor script for development use. For Live Reloading
- supertest: SuperAgent driven library for testing HTTP servers
​
## Installation

- Navigate to a directory using your favourite terminal.
​- Clone this repository on that directory.
​  . Using SSH; $ git clone git@github.com:Tawakalt/d0-cp2-document-management-system.git 
​  . Using HTTP; $ git clone https://github.com/Tawakalt/d0-cp2-document-management-system.git
​- Navigate to the rrepository's directory
​  . $ cd d0-cp2-document-management-system
​- Install the app's dependencies
​  $ npm install
​- Run the app
​  $ npm run postinstall
  $ npm start
​
## Tests
​
- The tests were written using Supertest.
- The test coverage is generated by istanbul
- To run tests, navigate to the project's root directory
- After installation, run the following command:
  $ npm test
​
## How to contribute

The main purpose of this repository is to continue to evolve the application, making it faster and easier to use. Development of the app happens in the open on GitHub, and we are grateful to the community for future contribution to bugfixes and improvements.

## Disclaimer

​- This app and its functions are limited by time constraint and is in no way at its best.

## License

​- (The MIT License)
​  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
​
- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
​
THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITIES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Author
- Olaniyi Tawakalt Taiwo
​