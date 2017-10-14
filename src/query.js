import _ from 'lodash';
import {
    isFilm, isActor
} from './utils/parsers';

export const runQueries = (graph, X = 5, year = 1995) => [
    { 
        desc: "Find how much a movie has grossed",
        res: graph.values()
                .filter(isMovie)
                .iFeelLucky()
                .grossingValue
    }, {
        desc: "List which movies an actor has worked in",
        res: graph.connectedNode('Morgan Freeman'),
    }, {
        desc: "List which actors worked in a movie",
        res: graph.connectedNode(
            _.chain(graph.values()).filter(isMovie)
                .map(({ name }) => ({ name, c : graph.connectedNode(name).length }))
                .maxBy(({ name }) => graph.connectedNode(name).length)
                .value().name
        )
    }, {
        desc: "List the top X actors with the most total grossing value",
        res: graph.values()
            .filter(isActor)
            .sort((a, b) => b.grossingValue - a.grossingValue)
            .slice(0, X)
            .map(({ name, grossingValue }) => ({ name, grossingValue }))
    }, {
        desc: "List the top X movies with the most total grossing value",
        res: graph.values()
            .filter(isMovie)
            .sort((a, b) => b.grossingValue - a.grossingValue)
            .slice(0, X)
            .map(({ name, grossingValue }) => ({ name, grossingValue }))
    }, {
        desc: "List the oldest X actors",
        res: graph.values()
            .filter(isActor)
            .sort((a, b) => b.age - a.age)
            .slice(0, X)
            .map(({ name, age }) => ({ name, age }))
    }, {
        desc: "List all the movies for a given year",
        res: graph.values()
            .filter(isMovie)
            .filter(({ releaseYear }) => releaseYear == 1995)
            .map(({ name, releaseYear }) => ({ name, releaseYear }))
    }, {
        desc: "List all the actors for a given year",
        res: _.chain(graph.values())
            .filter(isMovie)
            .filter(({ releaseYear }) => releaseYear == 1995)
            .map(({ name }) => name)
            .map(name => graph.connectedNode(name))
            .flatten()
            .uniq()
            .value()
    }, {
        desc: "Top hub actors",
        res: _.chain(graph.values())
            .filter(isActor)
            .map(actor => {
                let films = graph.connectedNode(actor.name);
                return {
                    name: actor.name,
                    relatedActor: _.chain(films)
                        .map(film => graph.connectedNode(film))
                        .flattenDeep()
                        .uniq()
                        .without(actor.name)
                        .value()
                };
            })
            .each(o => {
                o.count = o.relatedActor.length;
            })
            .sortBy('relatedActor.length')
            .reverse()
            .take(10)
            .value()
    }
];
