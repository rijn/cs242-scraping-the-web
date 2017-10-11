import { colorConsole } from 'tracer';
import { loggerConfig } from './config';
var log = colorConsole(loggerConfig);

import {
    ipcMain as ipc,
    app,
    dialog,
    BrowserWindow
} from 'electron';

import path from 'path';
import url from 'url';

import fs from 'fs';

let mainWindow;

// Create main window of election
let createWindow = () => {
    mainWindow = new BrowserWindow({width: 700, height: 800});
  
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    log.info('loading electron');
  
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

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

import Scraper from './scraper';
import Graph from './graph';
import _ from 'lodash';
import {
    isActor, isFilm,
    isNotInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    linkExtractor, informationExtractor,
    grossingValueParser, ageParser, releaseYearParser,
    sumGrossingValue
} from './utils';
import { runQueries } from './query';

// Initialize graph
log.info('initialize graph');
let graph = new Graph();

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
        if (!isActor($) && !isFilm($)) return;

        // Extrace information from infobox
        let info = informationExtractor($);

        // Set indicator
        if (isActor($)) info.isActor = true;
        if (isFilm($)) info.isFilm = true;

        // If it is a film, extract grossing value and released year
        if (info.isFilm) {
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
            if (info.isActor && task.info.isFilm || info.isFilm && task.info.isActor) {
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
    }
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

// Log agent for window thread
ipc.on('log', (event, { level = 'log', message = null } = {}) => {
    log[level](message);
});
