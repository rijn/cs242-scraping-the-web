/* jslint no-unuse-var: "off" */
import fs from 'fs';
import supertest from 'supertest';
import assert from 'assert';

let requireHelper = require('../../require-helper');
let Model = requireHelper('./model').default;

global.request = supertest;
global.assert = assert;

global._server = null;
global._model = Model;
global._data = null;

before(done => {
    requireHelper('./server')
        .then(({ server }) => {
            _server = server;

            _data = JSON.parse(fs.readFileSync('test/data.json'));
            Model.load(_data);
            _model = Model;

            done();
        }).catch(err => {
            console.error(err);
        });
});

after(function () {
    _server.close();
});
