import rp from 'request-promise';
import cheerio from 'cheerio';
import EventEmitter from 'events';
import _ from 'lodash';

class Resource extends EventEmitter {
    constructor ({
            uri
    } = {}) {
        super();
        this.uri = uri;
    }

    request () {
        rp({
            uri: this.uri,
            transform: (body) => cheerio.load(body)
        }).then($ => {
            this.emit('resolve', $);
        }).catch(err => {
            console.error(err.message);
        });
    }
}

export default class Scraper extends EventEmitter {
    constructor ({
        concurrency = 5,
        analyzer = null,
        keyFn = ({ uri }) => uri
    } = {}) {
        super();

        this.options = {
            concurrency
        };

        this.working = 0;
        this.queue = [];
        this.history = {};

        this.keyFn = keyFn;
        this.analyzer = analyzer;
    }

    start () {
        this.next();
    }

    push (tasks) {
        if (!_.isArray(tasks)) {
            tasks = [tasks];
        }
        _.forEach(tasks, task => {
            if (!this.history.hasOwnProperty(this.keyFn(task))) {
                this.history[this.keyFn(task)] = true;
                this.queue.push(new Resource(task));
                this.next();
            }
        });
    }

    next () {
        while (this.working < this.options.concurrency && this.queue.length > 0) {
            this.working++;

            let task = this.queue.shift();
            task.on('resolve', (function (_this, task) {
                return (_) => _this.resolve(_, task);
            })(this, task));
            task.request();
        }
    }

    resolve ($, task) {
        this.working--;

        // console.log(task.uri + ' resolved');

        if (_.isFunction(this.analyzer)) {
            this.analyzer.call(this, { $, task });
        }

        this.next();
    }
}

