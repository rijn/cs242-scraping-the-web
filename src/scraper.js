import { colorConsole } from 'tracer';
import { loggerConfig } from '../config';

import rp from 'request-promise';
import cheerio from 'cheerio';
import EventEmitter from 'events';
import _ from 'lodash';

var log = colorConsole(loggerConfig);

/**
 * Class to hold the web resources
 * @extends EventEmitter
 */
const Resource = class extends EventEmitter {
    /**
     * @constructs
     *
     * @param {string} uri
     * @param {Object} from Reference of previous step
     */
    constructor ({
        uri,
        from
    } = {}) {
        super();
        this.uri = uri;
        this.from = from;
    }

    /**
     * @memberof Resource
     * @function request
     *
     * @desc Send request and emit the result
     */
    request () {
        log.debug('requesting', this.uri);
        rp({
            uri: this.uri,
            transform: (body) => cheerio.load(body)
        }).then($ => {
            this.emit('resolve', $);
            log.debug('finish', this.uri);
        }).catch(e => {
            log.error(e.message);
        });
    }
};

/**
 * Class of scraper
 * @extends EventEmitter
 */
const Scraper = class Scraper extends EventEmitter {
    /**
     * @constructs
     *
     * @desc
     * <img src='https://g.gravizo.com/svg?
     *   digraph G {
     *     task -> Scraper;
     *     Scraper -> Resource;
     *     Resource -> analyzer [label="first time"];
     *     Resource -> resolver;
     *     analyzer -> Resource;
     *     analyzer -> task;
     *   }
     * '/>
     *
     * @param {Number} [concurrency=5] Number of tasks in parallel
     * @param {Function} [analyzer] Response analyzer
     * @param {Function} [resolver] Resource resolver
     * @param {Function} [keyFn] Lambda function that take task as parameter
     *   and return the key. Will use uri as default.
     */
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

        this.enabled = false;
    }

    /**
     * @memberof Scraper
     * @function enable
     *
     * @desc Enable the scraper.
     */
    enable () {
        this.enabled = true;
        this.next();
        log.info('scraper enabled');
    }

    /**
     * @memberof Scraper
     * @function disable
     *
     * @desc Disable the scraper.
     */
    disable () {
        this.enabled = false;
        log.info('scraper disabled');
    }

    /**
     * @memberof Scraper
     * @function count
     *
     * @desc Return count object.
     *
     * @returns {Object} Count object
     */
    count () {
        return {
            working: this.working,
            queue: this.queue.length
        };
    }

    /**
     * @memberof Scraper
     * @function push
     *
     * @desc Push task into the queue.
     *
     * @param {Task[]|Task} tasks The task or array of task need to be pushed
     */
    push (tasks) {
        if (!_.isArray(tasks)) {
            tasks = [tasks];
        }
        _.forEach(tasks, task => {
            if (!this.history.hasOwnProperty(this.keyFn(task))) {
                this.history[this.keyFn(task)] = false;
                this.queue.push(new Resource(task));
            } else {
                this.analyze(null, task);
            }
        });
    }

    /**
     * @memberof Scraper
     * @function next
     *
     * @desc Do the next job.
     */
    next () {
        if (!this.enabled) return;

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

    /**
     * @memberof Scraper
     * @function resolve
     *
     * @desc The function need to be called when Resource request finished.
     */
    resolve ($, task) {
        this.working--;

        this.analyze($, task);

        this.next();
    }

    /**
     * @memberof Scraper
     * @function analyze
     *
     * @desc The function need to be called when the task be poped out of the
     *   queue.
     */
    analyze ($, task) {
        if (!this.history[this.keyFn(task)] && _.isFunction(this.analyzer)) {
            log.debug('analyzing %s', this.keyFn(task));
            try {
                this.history[this.keyFn(task)] = this.analyzer({ $, task });
            } catch (e) {
                log.warning(e.message);
            }
        }

        if (this.history[this.keyFn(task)] && _.isFunction(this.resolver)) {
            log.debug('resolving %s', this.keyFn(task));
            try {
                this.resolver(this.history[this.keyFn(task)]);
            } catch (e) {
                log.warning(e.message);
            }
        }
    }

    /**
     * @memberof Scraper
     * @function searchHistory
     *
     * @desc Search the whole request history and filter out the result of
     *   specific tasks.
     *
     * @param {Task[]} tasks List of tasks that need to be searched
     *
     * @returns {Object[]} Return list of results of tasks from the analyzer
     */
    searchHistory (tasks) {
        return _.chain(tasks).map(this.keyFn).map(key => this.history[key]).value();
    }

    /**
     * @memberof Scraper
     * @function data
     *
     * @desc Return all data stored in the scraper.
     *
     * @returns {Object}
     */
    data () {
        return {
            history: this.history,
            queue: this.queue
        };
    }
    /**
     * @memberof Scraper
     * @function restore
     *
     * @desc Restore data from outside.
     *
     * @param {Object} obj
     */
    restore (obj) {
        this.history = obj.history;
        this.queue = obj.queue.map(t => new Resource(t));
    }
};

export default Scraper;
