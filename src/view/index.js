const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

// Log agent, so they may have same syntax
let log = (function () {
    let levels = ['log', 'trace', 'debug', 'info', 'warn', 'error'];

    let Log = function () {};

    _.each(levels, level => {
        Log.prototype[level] = (message) => {
            ipc.send('log', { level, message });
        };
    });

    return new Log();
})();

// Timer
let timer = (function () {
    var Timer = function () {
        this._t = null;
        this._v = 0;
    };

    Timer.prototype = {
        enable: function () {
            if (this._t) return;
            this._t = setInterval(() => {
                this._v++;
                if (this.onChange) this.onChange(this._v);
            }, 1000);
        },
        disable: function () {
            if (!this._t) return;
            clearInterval(this._t);
            this._t = null;
        },
        value: function () { return this._v; }
    };

    return new Timer();
})();

// Update UI when timer changed
timer.onChange = function (v) {
    document.getElementById('timer').innerHTML = (Math.floor(v / 60) < 10 ? '0' : '') +
        Math.floor(v / 60) + ':' + (v % 60 < 10 ? '0' : '') + v % 60;
};

// Update statistic
ipc.on('graph-statistic', (event, data) => {
    document.getElementById('node-count').innerHTML = data.node;
    document.getElementById('edge-count').innerHTML = data.edge;
});

ipc.on('scraper-statistic', (event, data) => {
    document.getElementById('queue-count').innerHTML = data.queue;
});

// Enable scraper
document.getElementById('start-btn').addEventListener('click', function (event) {
    ipc.send('start-scraper');
    timer.enable();
});

// Disable scraper
document.getElementById('stop-btn').addEventListener('click', function (event) {
    ipc.send('stop-scraper');
    timer.disable();
});

// Save data
document.getElementById('save-btn').addEventListener('click', function (event) {
    log.trace('save btn clicked');
    ipc.send('save-dialog');
});

// Load data
document.getElementById('load-btn').addEventListener('click', function (event) {
    log.trace('load btn clicked');
    ipc.send('open-dialog');
});

// Query all button
document.getElementById('query-all').addEventListener('click', function (event) {
    log.trace('query all btn clicked');
    let results = ipc.sendSync('query-all');

    if (!results) return;

    let compound = _.chain(results).map(({ desc = '', res = '' } = {}) => {
        return `<div class="item">
            <div class="content">
                <a class="header">${desc}</a>
                <div class="description" style="white-space: pre;">${JSON.stringify(res, null, 4)}</div>
            </div>
        </div>`;
    }).join('');

    document.getElementById('result-list').innerHTML = compound;
});

document.getElementById('open-plot').addEventListener('click', function (event) {
    ipc.send('open-plot');
});

document.getElementById('open-network').addEventListener('click', function (event) {
    ipc.send('open-network');
});

document.getElementById('load-external-json').addEventListener('click', function (event) {
    ipc.send('load-external-json');
});

log.info('render thread ready');
