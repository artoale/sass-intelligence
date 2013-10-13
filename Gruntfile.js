'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Task configuration.
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib_test: {
                src: ['lib/**/*.js', 'test/**/*.js']
            }
        },
        watch: {
			liveTest: {
				files: 'test/**/*.spec.js',
                tasks: ['mochaTest', ]		
			}
        },
        mochaTest: {
          test: {
            options: {
              reporter: 'spec',
			  quiet: true
            },
            src: ['test/**/*.spec.js'],
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
    grunt.registerTask('liveTest', ['mochaTest','watch:liveTest']);

};
