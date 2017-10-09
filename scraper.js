import rp from 'request-promise';
import cheerio from 'cheerio';
import EventEmitter from 'events';
import _ from 'lodash';

class Resource extends EventEmitter {
    constructor ({
        uri,
        from
    } = {}) {
        super();
        this.uri = uri;
        this.from = from;
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
        resolver = null,
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
        this.resolver = resolver;
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
                this.history[this.keyFn(task)] = false;
                this.queue.push(new Resource(task));
                this.next();
            } else {
                this.analyze(null, task);
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

        if (this.queue.length + this.working === 0) {
            this.emit('empty');
        }
    }

    resolve ($, task) {
        this.working--;

        this.analyze($, task);

        this.next();
    }

    analyze ($, task) {
        if (!this.history[this.keyFn(task)] && _.isFunction(this.analyzer)) {
            this.history[this.keyFn(task)] = this.analyzer.call(this, { $, task });
        }

        if (this.history[this.keyFn(task)] && _.isFunction(this.resolver)) {
            this.resolver.call(this, this.history[this.keyFn(task)]);
        }
    }

    searchHistory (tasks) {
        return _.chain(tasks).map(this.keyFn).map(key => this.history[key]).value();
    }
}

