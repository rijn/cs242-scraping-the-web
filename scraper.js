import rp from 'request-promise';
import cheerio from 'cheerio';
import EventEmitter from 'events';

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
        concurrency = 5
    } = {}) {
        super();
        this.options = {
            concurrency
        };

        this.working = 0;
        this.queue = [];
        this.history = {};
    }

    start () {
        this.next();
    }

    push (task) {
        this.queue.push(new Resource(task));
        this.next();
    }

    next () {
        while (this.working < this.options.concurrency && this.queue.length > 0) {
            this.working++;

            let task = this.queue.shift();
            task.on('resolve', (function (_this) { return (_) => _this.resolve(_); })(this));
            task.request();
        }
    }

    resolve ($) {
        this.working--;

        console.log('resolved');
        console.log(Object.keys($));

        this.next();
    }
}

