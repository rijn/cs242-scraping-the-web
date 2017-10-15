import _ from 'lodash';
import fs from 'fs';
import url from 'url';
import path from 'path';
import { colorConsole } from 'tracer';
import { loggerConfig } from '../config';

import {
    ipcMain as ipc,
    app,
    dialog,
    BrowserWindow
} from 'electron';

import Scraper from './scraper';
import Model from './model';
import {
    isActor, isMovie,
    isNotInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    linkExtractor, informationExtractor,
    grossingValueParser, ageParser, releaseYearParser,
    sumGrossingValue
} from './utils/parsers';
import { runQueries } from './query';

import './server';

let log = colorConsole(loggerConfig);

let mainWindow;

// Initialize graph
log.info('initialize graph');
let graph = Model.graph;

// Initialize scraper
log.info('initialize scraper');
let scraper = new Scraper({
    // Set concurrentcy to 10
    concurrency: 10,
    // Customized analyzer
    analyzer: function ({ $, task }) {
        // If cheerio is not ready, exit
        if (!$) return;
        // If current resource is neither actor nor film, exit
        if (!isActor($) && !isMovie($)) return;

        // Extrace information from infobox
        let info = informationExtractor($);

        // Set indicator
        if (isActor($)) info.isActor = true;
        if (isMovie($)) info.isMovie = true;

        // If it is a film, extract grossing value and released year
        if (info.isMovie) {
            info.grossingValue = grossingValueParser(info);
            info.releaseYear = releaseYearParser(info);
        }

        // If he is an actor, extract his age
        if (info.isActor) {
            info.age = ageParser(info);
        }

        // Extract all links from main and push into queue
        let dependencies = _
            .chain(linkExtractor($))
            .compact()
            .filter(isNotInnerLink)
            .filter(isWikiDomain)
            .filter(isNotFunctionalPage)
            .map(completeWikiDomain)
            .uniq()
            .map(uri => ({ uri, from: info.name }))
            .value();
        log.debug('%d dependencies founded', dependencies.length);
        this.push(dependencies);

        // Update statistic
        mainWindow.webContents.send('scraper-statistic', scraper.count());

        return { info, dependencies, from: task.from };
    },
    // Customized resolver
    resolver: function ({ info = null, dependencies = [], from = null } = {}) {
        let addRelation = function (task) {
            if (!task || !task.info) return;
            if ((info.isActor && task.info.isMovie) || (info.isMovie && task.info.isActor)) {
                graph.setEdge(info.name, task.info.name, info.grossingValue || task.info.grossingValue);
            }
        };

        // Set node of current item
        graph.setNode(info.name, info);

        // Add relation between current one and original one
        addRelation(graph.value(from));

        // Add relation between current one and all its dependencies
        _.chain(this.searchHistory(dependencies)).compact().each(addRelation).value();

        // If he is an actor, update his grossing value
        if (info.isActor) {
            info.grossingValue = sumGrossingValue(graph, info.name);
            graph.setNode(info.name, info);
        }

        // Update statistic
        mainWindow.webContents.send('graph-statistic', graph.count());
    }
});

// Push initial page
scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });

// Create main window of election
let createWindow = () => {
    mainWindow = new BrowserWindow({width: 700, height: 800});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'view/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    log.info('loading electron');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
};

// create window when prerequsite finished
app.on('ready', createWindow);

// Terminate thread when window closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Create window when app be activated
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Turn on or off the scraper
ipc.on('start-scraper', function () { scraper.enable(); });
ipc.on('stop-scraper', function () { scraper.disable(); });

// Run the queries
ipc.on('query-all', function (event) {
    var results = null;
    try {
        log.info('start query');
        results = runQueries(graph);
        log.info('finish query');
    } catch (e) {
        log.error('query failed', e.message);
    }
    event.returnValue = results;
});

// Load json file
ipc.on('open-dialog', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        multiSelections: false
    }, function (files) {
        if (files) {
            try {
                let d = fs.readFileSync(files[0]);
                let o = JSON.parse(d);
                scraper.restore(o.scraper);
                graph.restore(o.graph);
                mainWindow.webContents.send('scraper-statistic', scraper.count());
                mainWindow.webContents.send('graph-statistic', graph.count());
                log.info('data restored');
            } catch (e) {
                log.error(e.message);
            }
        }
    });
});

// Save json file
ipc.on('save-dialog', function (event) {
    const options = {
        title: 'Save',
        filters: [
            { name: 'JSON', extensions: ['json'] }
        ]
    };
    dialog.showSaveDialog(options, function (filename) {
        if (!filename) return;
        try {
            fs.writeFileSync(filename, JSON.stringify({
                scraper: scraper.data(),
                graph: graph.data()
            }));
            log.info('data saved');
        } catch (e) {
            log.error(e.message);
        }
    });
});

ipc.on('load-external-json', function (event) {
    dialog.showOpenDialog({
        properties: ['openFile'],
        multiSelections: false
    }, function (files) {
        if (files) {
            try {
                Model.load(JSON.parse(fs.readFileSync(files[0])));
                graph = Model.graph;
                mainWindow.webContents.send('graph-statistic', graph.count());
                log.info('data restored');
            } catch (e) {
                log.error(e);
            }
        }
    });
});

// Log agent for window thread
ipc.on('log', (event, { level = 'log', message = null } = {}) => {
    log[level](message);
});

var plotWindow;

ipc.on('open-plot', () => {
    if (plotWindow) return;

    plotWindow = new BrowserWindow({ width: 700, height: 500 });

    plotWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'view/plot.html'),
        protocol: 'file:',
        slashes: true
    }));

    plotWindow.on('closed', function () {
        plotWindow = null;
    });
});

ipc.on('plot-ready', () => {
    let actors = graph.values().filter(isActor);
    let films = graph.values().filter(isMovie);

    let yearGrossingValue = {};
    _.each(films, film => {
        yearGrossingValue[film.releaseYear] = (yearGrossingValue[film.releaseYear] || 0) + film.grossingValue;
    });

    plotWindow.webContents.send('data', {
        ageVsGrossingValue: {
            layout: {
                title: 'Age vs Grossing Value',
                xaxis: {
                    range: [ 20, 90 ],
                    title: 'Age'
                },
                yaxis: {
                    range: [ 0, 11e9 ],
                    title: 'Grossing Value'
                }
            },
            trace: {
                x: actors.map(actor => actor.age),
                y: actors.map(actor => actor.grossingValue),
                mode: 'markers',
                type: 'scatter'
            }
        },
        grossingValueOfYear: {
            layout: {
                title: 'Total Grossing Value of Year',
                xaxis: {
                    title: 'Year'
                },
                yaxis: {
                    title: 'Grossing Value'
                }
            },
            trace: {
                x: _.keys(yearGrossingValue),
                y: _.values(yearGrossingValue),
                type: 'scatter'
            }
        }
    });
});

let networkWindow;

ipc.on('open-network', () => {
    if (networkWindow) return;

    networkWindow = new BrowserWindow({ width: 800, height: 800 });

    networkWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'view/network.html'),
        protocol: 'file:',
        slashes: true
    }));

    networkWindow.on('closed', function () {
        networkWindow = null;
    });
});

ipc.on('network-ready', () => {
    let json = {
        nodes: _.map(graph.values(), value => ({
            name: value.name,
            isActor: value.isActor,
            age: value.age || 0,
            grossingValue: value.grossingValue || 0
        })),
        links: _.map(graph._edge, edge => ({ source: edge.v, target: edge.w }))
    };
    networkWindow.webContents.send('data', json);
});
