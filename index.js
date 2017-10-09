const electron = require('electron');
const ipc = electron.ipcMain;
const app = electron.app;
const dialog = electron.dialog
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

import fs from 'fs';

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 700, height: 800})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

import Scraper from './scraper';
import Graph from './graph';
import _ from 'lodash';
import {
    isActor, isFilm,
    notInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    linkExtractor, informationExtractor,
    grossingValueParser, ageParser, releaseYearParser,
    sumGrossingValue
} from './utils';
import { runQueries } from './query';

let graph = new Graph();

let scraper = new Scraper({
    concurrency: 10,
    analyzer: function ({ $, task }) {
        if (!$) return;
        if (!isActor($) && !isFilm($)) return;

        let info = informationExtractor($);

        if (isActor($)) info.isActor = true;
        if (isFilm($)) info.isFilm = true;

        if (info.isFilm) {
            info.grossingValue = grossingValueParser(info);
            info.releaseYear = releaseYearParser(info);
        }

        if (info.isActor) {
            info.age = ageParser(info);
        }

        let dependencies = _
            .chain(linkExtractor($))
            .compact()
            .filter(notInnerLink)
            .filter(isWikiDomain)
            .filter(isNotFunctionalPage)
            .map(completeWikiDomain)
            .uniq()
            .map(uri => ({ uri, from: info.name }))
            .value();

        this.push(dependencies);

        mainWindow.webContents.send('scraper-statistic', scraper.count());

        return { info, dependencies, from: task.from };
    },
    resolver: function ({ info = null, dependencies = [], from = null } = {}) {
        let addRelation = function (task) {
            if (!task || !task.info) return;
            if (info.isActor && task.info.isFilm || info.isFilm && task.info.isActor) {
                graph.setEdge(info.name, task.info.name, info.grossingValue || task.info.grossingValue);
            }
        };

        graph.setNode(info.name, info);

        addRelation(graph.value(from));
        _.chain(this.searchHistory(dependencies)).compact().each(addRelation).value();

        if (info.isActor) {
            info.grossingValue = sumGrossingValue(graph, info.name);
            graph.setNode(info.name, info);
        }

        mainWindow.webContents.send('graph-statistic', graph.count());
    }
});

scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });
// scraper.start();
scraper.on('empty', () => {
    console.log(runQueries(graph));
});

ipc.on('start-scraper', function () { scraper.enable(); });
ipc.on('stop-scraper', function () { scraper.disable(); });

ipc.on('query-all', function (event) {
    let results = runQueries(graph);
    event.returnValue = results;
});

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
            } catch (e) {
                console.error(e);
            }
        }
    });
});

ipc.on('save-dialog', function (event) {
    const options = {
        title: 'Save',
        filters: [
            { name: 'JSON', extensions: ['json'] }
        ]
    }
    dialog.showSaveDialog(options, function (filename) {
        if (!filename) return;
        fs.writeFileSync(filename, JSON.stringify({
            scraper: scraper.data(),
            graph: graph.data()
        }));
    })
})
