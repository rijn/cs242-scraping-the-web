/* jshint esversion: 5 */

'use strict';

// var _ = require('lodash');
// var webpack = require('webpack');
// var fs = require('fs');
var serveStatic = require('serve-static');
var args = process.argv.slice(2);

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    var lrPort = 35729;
    var lrSnippet = require('connect-livereload')({ port: lrPort });
    var lrMiddleware = function (connect, options) {
        return [
            lrSnippet,
            serveStatic(options.base[0])
        ];
    };

    grunt.initConfig({
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
                    script: './src/bootstrap.js',
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
