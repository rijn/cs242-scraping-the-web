import _ from 'lodash';
import Graph from './graph';
import Promise from 'bluebird';
import { isActor, isMovie } from './utils/parsers';

let model = {};

model = {
    graph: new Graph(),
    get: (filter, attrs) => {
        return Promise.resolve(_.chain(model.graph.values())
            .filter(filter)
            .filter(v => _.isMatch(v, attrs))
            .value());
    },
    insert: (key, attrs) => {
        model.graph.setNode(key, attrs);
        return Promise.resolve();
    },
    update: (key, attrs) => {
        model.graph.setNode(key, _.assign(model.graph.value(key), attrs));
        return Promise.resolve();
    },
    delete: (key) => {
        model.graph.removeNode(key);
        return Promise.resolve();
    },
    load: (objs) => {
        model.graph = new Graph();

        _.each(objs, obj => {
            _.each(obj, (value, key) => {
                value.isActor = value.json_class === 'Actor';
                value.isMovie = value.json_class === 'Movie';
                value.grossingValue = value.total_gross || value.box_office;
                value.releaseYear = value.year;
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
    get: (attrs) => model.get(isActor, attrs),
    insert: (attrs) => model.insert(attrs.name, _.assign(attrs, { isActor: true })),
    update: model.update,
    delete: model.delete
};

model.movie = {
    get: (attrs) => model.get(isMovie, attrs),
    insert: (attrs) => model.insert(attrs.name, _.assign(attrs, { isMovie: true })),
    update: model.update,
    delete: model.delete
};

export default model;
