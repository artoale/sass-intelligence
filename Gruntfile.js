/*global module:true*/
module.exports = function (grunt) {
    'use strict';
    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/**/*.js'],
            },
            test: {
                src: ['test/**/*.js'],
            }
        },
        watch: {
            liveTest: {
                files: ['test/**/*.spec.js', 'src/**/*.js', 'test/functional/*.js'],
                tasks: ['mochaTest']
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            unit: {
                src: ['test/**/*.spec.js']
            },
            functional: {
                src: ['test/functional/*.js']
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Default task.
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('liveTest', ['watch:liveTest']);

};
