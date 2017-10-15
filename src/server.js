import _ from 'lodash';
import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import routerLoader from './utils/router-loader';
import { isNumeric } from './utils/parsers';

const app = express();

// Loda json body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Parse potentoal number
app.use((req, res, next) => {
    _.each(req.query, (value, key) => {
        if (isNumeric(value)) {
            req.query[key] = Number(value);
        }
    });
    next();
});

// Load controllers
routerLoader(app, path.join(__dirname, 'controllers'), {
    excludeRules: /get|post|put|delete/gi
});

// Response 404 if no route matched
app.use((req, res, next) => {
    res.status(404).send({
        'error': 'Undefined API'
    });
});

let port = process.env.PORT || 8080;

var server;

module.exports = Promise.resolve().then(() => {
    return new Promise((resolve) => {
        server = http.createServer(app).listen(port, () => {
            var port = server.address().port;
            console.log('Server is listening on ' + port);
            resolve({ server });
        });
    });
});
