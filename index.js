import Scraper from './scraper';
import Graph from './graph';
import _ from 'lodash';
import {
    isActor, isFilm,
    notInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    linkExtractor, informationExtractor
} from './utils';

let graph = new Graph();

var old_time = new Date();
var count = 0;

let scraper = new Scraper({
    concurrency: 10,
    analyzer: function ({ $ }) {
        if (count > 10) return;

        if (!$) return;
        if (!isActor($) && !isFilm($)) return;

        let info = informationExtractor($);

        let dependencies = _
            .chain(linkExtractor($))
            .compact()
            .filter(notInnerLink)
            .filter(isWikiDomain)
            .filter(isNotFunctionalPage)
            .map(completeWikiDomain)
            .uniq()
            .map(uri => ({ uri }))
            .value();

        this.push(dependencies.slice(1,10));

        count ++;
        var new_time = new Date();
        var seconds_passed = new_time - old_time;
        console.log((seconds_passed / 1000).toFixed(2), count);

        return { info, dependencies };
    },
    resolver: function ({ info = null, dependencies = [] } = {}) {
        graph.setNode(info.name, info);
        _.chain(this.searchHistory(dependencies)).compact().each(task => {
            graph.setEdge(info.name, task.info.name);
        }).value();

        console.log('# node = ' + graph.count().node + ', # edge = ' + graph.count().edge);
    }
});
scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });
scraper.start();
scraper.on('empty', () => {
    console.log(graph.connectedNode('Morgan Freeman'));
});
