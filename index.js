import Scraper from './scraper';

let scraper = new Scraper();
scraper.push({ uri: 'https://en.wikipedia.org/wiki/Morgan_Freeman' });
scraper.start();
