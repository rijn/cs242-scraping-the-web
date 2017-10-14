const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

let data;

ipc.on('data', (event, d) => {
    data = d;

    let key = Object.keys(d)[0];
    Plotly.plot('plot', [ data[key].trace ], data[key].layout);

    document.getElementById('links').innerHTML = '';
    _.each(data, (value, key) => {
        var a = document.createElement('a');
        a.innerHTML = value.layout.title;
        a.className = 'link';
        a.key = key;
        document.getElementById('links').appendChild(a);
    });
});

document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.className = 'link') {
        let key = event.target.key;
        Plotly.newPlot('plot', [ data[key].trace ], data[key].layout);
    }
});

ipc.send('plot-ready');
