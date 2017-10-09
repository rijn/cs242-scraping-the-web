const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

let timer = (function () {
    var Timer = function () {
        this._t = null;
        this._v = 0;
    };

    Timer.prototype = {
        enable: function () {
            if (this._t) return;
            this._t = setInterval(() => {
                console.log(this);
                this._v ++;
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

timer.onChange = function (v) {
    document.getElementById('timer').innerHTML = (Math.floor(v / 60) < 10 ? '0' : '') +
        Math.floor(v / 60) + ':' + (v % 60 < 10 ? '0' : '') + v % 60;
};

document.getElementById('start-btn').addEventListener('click', function (event) {
    ipc.send('start-scraper');
    timer.enable();
});

document.getElementById('stop-btn').addEventListener('click', function (event) {
    ipc.send('stop-scraper');
    timer.disable();
});

ipc.on('graph-statistic', (event, data) => {
    document.getElementById('node-count').innerHTML = data.node;
    document.getElementById('edge-count').innerHTML = data.edge;
});

ipc.on('scraper-statistic', (event, data) => {
    document.getElementById('queue-count').innerHTML = data.queue;
});

document.getElementById('query-all').addEventListener('click', function (event) {
    let results = ipc.sendSync('query-all');

    let compound = _.chain(results).map(({ desc = '', res = '' } = {}) =>
        `<div class="item">
            <div class="content">
                <a class="header">${ desc }</a>
                <div class="description">${ JSON.stringify(res) }</div>
            </div>
        </div>`).join('');
    
    document.getElementById('result-list').innerHTML = compound;
});

document.getElementById('save-btn').addEventListener('click', function (event) {
    ipc.send('save-dialog');
});

document.getElementById('load-btn').addEventListener('click', function (event) {
    ipc.send('open-dialog');
});
