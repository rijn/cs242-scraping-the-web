let requireHelper = require('../require-helper');
let parsers = requireHelper('./utils/parsers');
let Graph = requireHelper('./graph').default;

describe('parsers', () => {
    it('iFeelLucky should return element from array', () => {
        [1].iFeelLucky().should.equal(1);
    });

    it('linkExtractor should retrieve all links in bodyContent', () => {
        let $ = cheerio.load('<div id="bodyContent"><a href="test"></a></div>');
        parsers.linkExtractor($).should.eql(['test']);
    });

    it('isNotInnerLink should return false if the link is start with #', () => {
        parsers.isNotInnerLink('#').should.be.false;
        parsers.isNotInnerLink('http://').should.be.true;
    });

    it('isWikiDomain should return true if the link is a sub page', () => {
        parsers.isWikiDomain('/wiki/123').should.be.true;
        parsers.isWikiDomain('http://').should.be.false;
    });

    it('isNotFunctionalPage should return false if the link contain :', () => {
        parsers.isNotFunctionalPage(':').should.be.false;
    });

    it('completeWikiDomain should add wiki domain', () => {
        parsers.completeWikiDomain('/test').should.equal('https://en.wikipedia.org/test');
    });

    it('sumGrossingValue should sum connectivity in graph', () => {
        let graph = new Graph();
        graph.setEdge(1, 2, 1);
        graph.setEdge(1, 3, 2);
        parsers.sumGrossingValue(graph, 1).should.equal(1 + 2);
    });

    it('releaseYearParser should parse release year from info', () => {
        parsers.releaseYearParser({ 'Release date': '1920-30-12' }).should.equal('1920');
    });

    it('ageParser should parse age from info', () => {
        parsers.ageParser({ 'birth': '1920-30-12 (age 13)' }).should.equal('13');
    });

    it('grossingValueParser should parse the box office from info', () => {
        parsers.grossingValueParser({ 'Box office': '123' }).should.equal(123);
        parsers.grossingValueParser({ 'Box office': '$123' }).should.equal(123);
    });
});
