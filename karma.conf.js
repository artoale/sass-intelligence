/*globals module:true */
// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    'use strict';
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'requirejs'],

        reporters: ['progress', 'brackets'],
        files: [
            {
                pattern: 'src/**/*.js',
                included: false
            }, {
                pattern: 'bower_components/**/*.js',
                included: false
            }, {
                pattern: 'node_modules/**/*.js',
                included: false
            },{
                pattern: 'test/**/*.spec.js',
                included: false
            },

            'main-test.js'
        ],

        // list of files / patterns to exclude
        exclude: [
            'src/main.js'
        ],

        // web server port
        port: 8080,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome', 'PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
