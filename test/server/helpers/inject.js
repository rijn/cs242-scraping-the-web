/* jslint no-unuse-var: "off" */

var requireHelper = require('../../require-helper');

let Model = requireHelper('./model').default;

import fs from 'fs';

global.request = require('supertest');
global.assert = require('assert');
global._ = require('lodash');

global._server = null;
global._model = Model;

Model.load(JSON.parse(fs.readFileSync('test/data.json')));

// initialize model

before(done => {
    requireHelper('./server')
        .then(({ server }) => {
            _server = server;
            _model = Model;
            done();
        }).catch(err => {
            console.error(err);
        });
});

after(function () {
    _server.close();
});
