/* jshint esversion: 5 */

'use strict';

// var _ = require('lodash');
// var webpack = require('webpack');
// var fs = require('fs');
var serveStatic = require('serve-static');
var args = process.argv.slice(2);

var path = require('path');

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-istanbul');

    var lrPort = 35729;
    var lrSnippet = require('connect-livereload')({ port: lrPort });
    var lrMiddleware = function (connect, options) {
        return [
            lrSnippet,
            serveStatic(options.base[0])
        ];
    };

    grunt.initConfig({
        env: {
            coverage: {
                APP_DIR_FOR_CODE_COVERAGE: path.join(__dirname, './test/coverage/instrument/src/')
            }
        },
        shell: {
            electron: {
                command: 'electron -r babel-register src'
            }
        },
        watch: {
            server: {
                files: [
                    'src/controllers/**/*.js'
                ],
                tasks: [ 'eslint', 'express:dev' ],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        },
        express: {
            options: {
            },
            dev: {
                options: {
                    script: './bootstrap.js',
                    port: 8080,
                    args: []
                }
            }
        },
        eslint: {
            target: [
                'src/**/*.js'
            ]
        },
        connect: {
        },
        jsdoc : {
            dist : {
                src: [ 'src/**/*.js', 'README.md' ],
                options: {
                    destination: 'doc',
                    encoding: 'utf8',
                    template: './node_modules/minami'
                }
            }
        }
    });

    require('./test/mocha.conf')(grunt);

    grunt.registerTask('electron', [ 'eslint', 'shell:electron' ]);

    grunt.registerTask('dev', function (target) {
        if (target !== 'server') {
        }
        grunt.task.run([
            'eslint',
            'express:dev',
            target === 'client' ? 'keepalive' : 'watch:server'
        ]);
    });
};
