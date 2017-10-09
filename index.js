import Scraper from './scraper';
import _ from 'lodash';
import {
    isActor, isFilm,
    notInnerLink, isWikiDomain, isNotFunctionalPage,
    completeWikiDomain,
    informationExtractor
} from './utils';

var old_time = new Date();
var count = 0;

let scraper = new Scraper({
    concurrency: 10,
    analyzer: function ({ $ }) {
        if (!isActor($) && !isFilm($)) return;

        var links = [];
        $('#bodyContent a').each((i, link) => {
            links.push($(link).attr('href'));
        });
        this.push(_.chain(links)
            .compact()
            .filter(notInnerLink)
            .filter(isWikiDomain)
            .filter(isNotFunctionalPage)
            .map(completeWikiDomain)
            .map(uri => ({ uri }))
            .value());

        count ++;
        var new_time = new Date();
        var seconds_passed = new_time - old_time;
        console.log((seconds_passed / 1000).toFixed(2), count);

        // console.log($('#firstHeading').text());
        // console.log('isActor', isActor($), 'isFilm', isFilm($));
        console.log(informationExtractor($).name);
    }
});
scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });
scraper.start();
