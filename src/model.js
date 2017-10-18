import _ from 'lodash';
import Graph from './graph';
import Promise from 'bluebird';
import { isActor, isMovie } from './utils/parsers';

/**
 * @class Model
 */
let model = {};

model = {
    /**
     * @memberof Model
     * @member {Graph} graph
     */
    graph: new Graph(),

    /**
     * @memberof Model
     * @function get
     *
     * @desc Get values from model.
     *
     * @param {Function} filter
     * @param {Object} attrs
     *
     * @returns {Promise}
     */
    get: (filter, attrs, accumulator = (i, v) => i && v, initial = true) => {
        let exact = {};
        let reg = {};
        _.each(attrs, (value, key) => {
            if (_.isRegExp(value)) {
                reg[key] = value;
            } else {
                exact[key] = value;
            }
        });
        return Promise.resolve(_.chain(model.graph.values())
            .filter(filter)
            .filter(v => {
                return _.reduce(_.concat(
                    _.map(_.cloneDeep(reg), (r, k) => r.test(v[k])),
                    _.map(_.cloneDeep(exact), (r, k) => r === v[k])
                ), accumulator, initial);
            })
            .value());
    },

    /**
     * @memberof Model
     * @function insert
     *
     * @desc Insert value to model.
     *
     * @param {string} key
     * @param {Object} attrs
     *
     * @returns {Promise}
     */
    insert: (key, attrs) => {
        model.graph.setNode(key, attrs);
        return Promise.resolve();
    },

    /**
     * @memberof Model
     * @function update
     *
     * @desc Update value of model.
     *
     * @param {string} key
     * @param {Object} attrs
     *
     * @returns {Promise}
     */
    update: (key, attrs) => {
        model.graph.setNode(key, _.assign(model.graph.value(key), attrs));
        return Promise.resolve();
    },

    /**
     * @memberof Model
     * @function delete
     *
     * @desc Delete value in model.
     *
     * @param {string} key
     *
     * @returns {Promise}
     */
    delete: (key) => {
        model.graph.removeNode(key);
        return Promise.resolve();
    },

    /**
     * @memberof Model
     * @function load
     *
     * @desc Load external json object
     *
     * @param {Object} obj
     */
    load: (objs) => {
        model.graph = new Graph();

        _.each(objs, obj => {
            _.each(obj, (value, key) => {
                value.isActor = value.json_class === 'Actor';
                value.isMovie = value.json_class === 'Movie';
                value.grossingValue = value.total_gross || value.box_office;
                if (value.isMovie) {
                    value.releaseYear = value.year;
                }
                model.graph.setNode(key, value);
                _.each(value.actors || value.movies, (ck) => {
                    model.graph.setEdge(key, ck);
                });
            });
        });

        model.graph.removeNode(_.chain(model.graph._node).map((value, key) => {
            return !value ? key : null;
        }).compact().value());

        _.each(model.graph.values().filter(isMovie), movie => {
            _.each(model.graph.connectedNode(movie.name), actor => {
                model.graph.setEdge(movie.name, actor, movie.grossingValue);
            });
        });

        _.each(model.graph.values().filter(isActor), actor => {
        });
    }
};

model.actor = {
    get: (attrs, accumulator, initial) => model.get(isActor, attrs, accumulator, initial),
    insert: (attrs) => model.insert(attrs.name, _.assign(attrs, { isActor: true })),
    update: model.update,
    delete: model.delete
};

model.movie = {
    get: (attrs, accumulator, initial) => model.get(isMovie, attrs, accumulator, initial),
    insert: (attrs) => model.insert(attrs.name, _.assign(attrs, { isMovie: true })),
    update: model.update,
    delete: model.delete
};

export default model;
