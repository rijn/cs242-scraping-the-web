import _ from 'lodash';
import Graph from './graph';
import Promise from 'bluebird';
import { isActor, isMovie } from './utils/parsers';

const graph = new Graph();

let model = {};

model = {
    graph,
    get: (filter, attrs) => {
        return Promise.resolve(_.chain(graph.values())
            .filter(filter)
            .filter(v => _.isMatch(v, attrs))
            .value());
    },
    insert: (attrs) => {
        graph.setNode(attrs.name, attrs);
        return Promise.resolve();
    },
    load: (objs) => {
        _.each(objs, obj => {
            _.each(obj, (value, key) => {
                value.isActor = value.json_class === 'Actor';
                value.isMovie = value.json_class === 'Movie';
                value.grossingValue = value.total_gross || value.box_office;
                graph.setNode(key, value);
                _.each(value.actors || value.movies, (ck) => {
                    graph.setEdge(key, ck);
                });
            });
        });

        graph.removeNode(_.chain(graph._node).map((value, key) => {
            return !value ? key : null;
        }).compact().value());

        _.each(graph.values().filter(isMovie), movie => {
            _.each(graph.connectedNode(movie.name), actor => {
                graph.setEdge(movie.name, actor, movie.grossingValue);
            });
        });

        _.each(graph.values().filter(isActor), actor => {
        });
    }
};

model.actor = {
    get: (attrs) => model.get(isActor, attrs),
    insert: (attrs) => model.insert(_.assign(attrs, { isActor: true }))
};

model.movie = {
    get: (attrs) => model.get(isMovie, attrs),
    insert: (attrs) => model.insert(_.assign(attrs, { isMovie: true }))
};

export default model;
