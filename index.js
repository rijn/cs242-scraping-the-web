import Scraper from './scraper';
import Graph from './graph';
import _ from 'lodash';
import {
    isActor, isFilm,
    notInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    linkExtractor, informationExtractor,
    grossingValueParser, ageParser, releaseYearParser,
    sumGrossingValue
} from './utils';
import { runQueries } from './query';

let graph = new Graph();

var old_time = new Date();
var count = 0;

let scraper = new Scraper({
    concurrency: 7,
    analyzer: function ({ $, task }) {
        if (!$) return;
        if (!isActor($) && !isFilm($)) return;

        let info = informationExtractor($);

        if (isActor($)) info.isActor = true;
        if (isFilm($)) info.isFilm = true;

        if (info.isFilm) {
            info.grossingValue = grossingValueParser(info);
            info.releaseYear = releaseYearParser(info);
        }

        if (info.isActor) {
            info.age = ageParser(info);
        }

        let dependencies = _
            .chain(linkExtractor($))
            .compact()
            .filter(notInnerLink)
            .filter(isWikiDomain)
            .filter(isNotFunctionalPage)
            .map(completeWikiDomain)
            .uniq()
            .map(uri => ({ uri, from: info.name }))
            .value();


        if (count < 200) this.push(dependencies.slice(1,10));

        count ++;
        var new_time = new Date();
        var seconds_passed = new_time - old_time;
        console.log((seconds_passed / 1000).toFixed(2), count);

        return { info, dependencies, from: task.from };
    },
    resolver: function ({ info = null, dependencies = [], from = null } = {}) {
        let addRelation = function (task) {
            if (!task || !task.info) return;
            if (info.isActor && task.info.isFilm || info.isFilm && task.info.isActor) {
                graph.setEdge(info.name, task.info.name, info.grossingValue || task.info.grossingValue);
            }
        };

        graph.setNode(info.name, info);

        addRelation(graph.value(from));
        _.chain(this.searchHistory(dependencies)).compact().each(addRelation).value();

        if (info.isActor) {
            info.grossingValue = sumGrossingValue(graph, info.name);
            graph.setNode(info.name, info);
        }

        // console.log('# node = ' + graph.count().node + ', # edge = ' + graph.count().edge);
    }
});
scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });
scraper.start();
scraper.on('empty', () => {
    console.log(runQueries(graph));
});
