import _ from 'lodash';
import {
    isFilm, isActor
} from './utils';

export const runQueries = (graph, X = 5, year = 1995) => [
    { 
        desc: "Find how much a movie has grossed",
        res: graph.values()
                .filter(isFilm)
                .iFeelLucky()
                .grossingValue
    }, {
        desc: "List which movies an actor has worked in",
        res: graph.connectedNode('Morgan Freeman'),
    }, {
        desc: "List which actors worked in a movie",
        res: graph.connectedNode(
            _.chain(graph.values()).filter(isFilm)
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
            .filter(isFilm)
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
            .filter(isFilm)
            .filter(({ releaseYear }) => releaseYear == 1995)
            .map(({ name, releaseYear }) => ({ name, releaseYear }))
    }, {
        desc: "List all the actors for a given year",
        res: _.chain(graph.values())
            .filter(isFilm)
            .filter(({ releaseYear }) => releaseYear == 1995)
            .map(({ name }) => name)
            .map(name => graph.connectedNode(name))
            .flatten()
            .uniq()
            .value()
    }
];
