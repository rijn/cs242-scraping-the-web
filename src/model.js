import _ from 'lodash';
import Graph from './graph';
import { isActor, isMovie } from './utils/parsers';

const graph = new Graph();

const model = {
    graph,
    actor: {
        get: (attrs) => {
            return _.chain(graph.values())
                .filter(isActor)
                .filter(actor => {
                    _.isMatch(actor, attrs);
                });
        }
    },
    movie: {
    }
};

export default model;
