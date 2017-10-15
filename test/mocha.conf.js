'use strict';

var _ = require('lodash');
var fs = require('fs');

module.exports = function (grunt) {
    var mochaTest = {
        options: {
            reporter: 'spec',
            quiet: false,
            noFail: false,
            clearRequireCache: false,
            require: [ 'babel-register' ]
            // reporter: 'list'
        },
        sharedFiles: [
            'test/server/helper/**/*.js'
        ],
        all: { src: [
            'test/unit/**/*.spec.js',
            'test/server/**/*.spec.js'
        ] }
    };

    var helperDir = 'test/server/helpers';

    var helpers = fs.readdirSync(helperDir).
        filter(file => /.js$/g.test(file))
        .map(file => helperDir + '/' + file);

    _.forEach(mochaTest, test => {
        if (test.src) {
            test.src = helpers.concat(test.src);
        }
    });

    var isparta = require('isparta');

    grunt.config.merge({
        instrument: {
            files: 'src/**/*.js',
            options: {
                lazy: true,
                basePath: 'test/coverage/instrument/',
                babel: { ignore: false },
                instrumenter: isparta.Instrumenter
            }
        },
        mochaTest,
        storeCoverage: {
            options: {
                dir: 'test/coverage/reports'
            }
        },
        makeReport: {
            src: 'test/coverage/reports/**/*.json',
            options: {
                type: 'lcov',
                dir: 'test/coverage/reports',
                print: 'detail'
            }
        }
    });

    grunt.registerTask('mocha', [ 'mochaTest' ]);

    grunt.registerTask('coverage', [
        'env:coverage',
        'instrument',
        'mochaTest',
        'storeCoverage',
        'makeReport'
    ]);
};
