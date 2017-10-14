import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import routerLoader from './utils/router-loader';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routerLoader(app, path.join(__dirname, 'controllers'), {
    excludeRules: /get|post|put|delete/gi
});

app.use(function (req, res, next) {
    res.status(404).send({
        'error': 'Undefined API'
    });
});

let port = process.env.PORT || 8080;

const server = http.Server(app).listen(port, () => {
    var port = server.address().port;
    console.log('Server is listening on ' + port);
});

