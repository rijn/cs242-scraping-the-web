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
        unit: { src: [
            'test/unit/**/*.spec.js',
        ] },
        server: { src: [
            'server-helper',
            'test/server/**/*.spec.js'
        ] }
    };

    var serverHelperDir = 'test/server/helpers';
    var generalHelperDir = 'test/helpers';

    var serverHelpers = fs.readdirSync(serverHelperDir)
        .filter(file => /.js$/g.test(file))
        .map(file => serverHelperDir + '/' + file);
    var generalHelpers = fs.readdirSync(generalHelperDir)
        .filter(file => /.js$/g.test(file))
        .map(file => generalHelperDir + '/' + file);

    _.forEach(mochaTest, test => {
        if (test.src) {
            if (test.src[0] === 'server-helper') {
                test.src.shift();
                test.src = serverHelpers.concat(test.src);
            }
            test.src = generalHelpers.concat(test.src);
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
