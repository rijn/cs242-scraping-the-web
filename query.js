import _ from 'lodash';
import {
    isFilm, isActor
} from './utils';

export const runQueries = (graph, X = 5, year = 1995) => [
    // Find how much a movie has grossed
    graph.values()
        .filter(isFilm)
        .iFeelLucky()
        .grossingValue,

    // List which movies an actor has worked in
    graph.connectedNode('Morgan Freeman'),

    // List which actors worked in a movie
    graph.connectedNode(
        _.chain(graph.values()).filter(isFilm)
            .map(({ name }) => ({ name, c : graph.connectedNode(name).length }))
            .maxBy(({ name }) => graph.connectedNode(name).length)
            .value().name
    ),

    // List the top X actors with the most total grossing value
    graph.values()
        .filter(isActor)
        .sort((a, b) => b.grossingValue - a.grossingValue)
        .slice(0, X)
        .map(({ name, grossingValue }) => ({ name, grossingValue })),

    // List the top X movies with the most total grossing value
    graph.values()
        .filter(isFilm)
        .sort((a, b) => b.grossingValue - a.grossingValue)
        .slice(0, X)
        .map(({ name, grossingValue }) => ({ name, grossingValue })),

    // List the oldest X actors
    graph.values()
        .filter(isActor)
        .sort((a, b) => b.age - a.age)
        .slice(0, X)
        .map(({ name, age }) => ({ name, age })),

    // List all the movies for a given year
    graph.values()
        .filter(isFilm)
        .filter(({ releaseYear }) => releaseYear == 1995)
        .map(({ name, releaseYear }) => ({ name, releaseYear })),

    // List all the actors for a given year
    _.chain(graph.values())
        .filter(isFilm)
        .filter(({ releaseYear }) => releaseYear == 1995)
        .map(({ name }) => name)
        .map(name => graph.connectedNode(name))
        .flatten()
        .uniq()
        .value(),
];
