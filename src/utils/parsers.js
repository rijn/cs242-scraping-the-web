import _ from 'lodash';

/* eslint-disable no-extend-native */
Array.prototype.iFeelLucky = function () {
    return this[_.random(0, this.length - 1)];
};

/**
 * @function linkExtractor
 *
 * @desc Extract all hyperlinks from the body
 *
 * @param {Cheerio} $
 *
 * @return {string[]}
 */
export const linkExtractor = $ => {
    var links = [];
    $('#bodyContent a').each((i, link) => {
        links.push($(link).attr('href'));
    });
    return links;
};

/**
 * @function isNotInnerLink
 *
 * @desc Return true if the link is not an anchor link
 *
 * @param {string} link
 *
 * @returns {boolean}
 */
export const isNotInnerLink = (link) => link[0] !== '#';

/**
 * @function isWikiDomain
 *
 * @desc Return true if the link is under wiki domain
 *
 * @param {string} link
 *
 * @returns {boolean}
 */
export const isWikiDomain = (link) => link.indexOf('/wiki/') === 0;

/**
 * @function isNotFunctionalPage
 *
 * @desc Return true if the link is not a functional page of wiki
 *
 * @param {string} link
 *
 * @returns {boolean}
 */
export const isNotFunctionalPage = (link) => link.indexOf(':') === -1;

/**
 * @function completeWikiDomain
 *
 * @desc Complete the domain and the "https"
 *
 * @param {string} link
 *
 * @returns {string}
 */
export const completeWikiDomain = link => 'https://en.wikipedia.org' + link;

/**
 * @function isActor
 *
 * @desc Return true if current resource is an actor
 *
 * @param {Cheerio} $
 *
 * @return {boolean}
 */
export const isActor = ($) => $.isActor ||
    (_.isFunction($) && $('.role').text() === 'Actor');

/**
 * @function isMovie
 *
 * @desc Return true if current resource is a film
 *
 * @param {Cheerio} $
 *
 * @return {boolean}
 */
export const isMovie = ($) => $.isMovie ||
    (_.isFunction($) &&
        $('table.infobox.vevent > tbody').text().indexOf('Box office') !== -1);

/**
 * @function informationExtractor
 *
 * @desc Extract information from the info box
 *
 * @param {Cheerio} $
 * 
 * @return {Object} All information from the first info box
 */
export const informationExtractor = ($) => {
    var result = {
        name: ($('table.infobox').first().find('tr').first().find('.fn').text() ||
            $('table.infobox').first().find('tr').first().text())
            .replace(/\n/g, ''),
        img: $('table.infobox').first().find('img')
            .first().attr('src')
    };
    $('table.infobox').first().find('tr').each((i, c) => {
        let key = $(c).children('th').text()
            .replace(/\n\s*\n/g, '\n')
            .replace(/^\n*/g, '')
            .replace(/\n*$/g, '');
        let value = $(c).children('td').text()
            .replace(/\n\s*\n/g, '\n')
            .replace(/^\n*/g, '')
            .replace(/\n*$/g, '');
        if (key && value) {
            result[key] = value;
        }
    });
    return result;
};

/**
 * @function isNumeric
 *
 * @desc Return true if the string is a number
 *
 * @param {string} s
 *
 * @return {boolean}
 */
export const isNumeric = s => /^-?\d+\.?\d*$/.test(s);

/**
 * @function currencyParser
 *
 * @desc Parse the string of currency and convert it into number in dollar
 *
 * @param {string} s
 *
 * @return {Number}
 */
export const currencyParser = (s) => {
    if (s.indexOf('Inflation') !== -1) return 0;
    let currency = s
        .replace(/\[.*\]/g, '')
        .replace(/\(.*\)/g, '')
        .replace(/ *\([^)]*\) */g, '')
        .replace(/[\d.]*–/g, '')
        .replace('billion', '*1000000000')
        .replace('million', '*1000000')
        .replace(/ *\([^)]*\) */g, '')
        .replace(/[a-zA-Z,]/g, '')
        .replace(/\s/g, '');
    let symbol = currency.charAt(0);
    if (!isNumeric(symbol)) {
        currency = currency.split('').slice(1).join('');
    } else {
        symbol = '$';
    }
    let currencyFactor = {
        '¥': 0.15,
        '£': 1.24,
        '₤': 1.24,
        '€': 1.06,
        '$': 1
    };
    // eslint-disable-next-line
    return eval(currency) * (currencyFactor[symbol] ? currencyFactor[symbol] : 1);
};

/**
 * @function grossingValueParser
 *
 * @desc Extract grossing value from the info
 *
 * @param {Info} info Info get from the `informationExtractor`
 *
 * @returns {Number}
 */
export const grossingValueParser = (info) => {
    return _(info['Box office'])
        .split('\n')
        .compact()
        .map(currencyParser)
        .filter(n => !_.isNaN(n))
        .sum();
};

/**
 * @function ageParser
 *
 * @desc Extract age from the info
 *
 * @param {Info} info Info get from the `informationExtractor`
 *
 * @returns {Number}
 */
export const ageParser = (info) => {
    return _.chain(info)
        .values()
        .filter(_.isString)
        .map(s => _.get(/\(age.(\d*)\)/g.exec(s), '1'))
        .flatten()
        .compact()
        .head()
        .value();
};

/**
 * @function releaseYearParser
 *
 * @desc Extract release year from the info
 *
 * @param {Info} info Info get from the `informationExtractor`
 *
 * @returns {Number}
 */
export const releaseYearParser = (info) => {
    return _.get(/((19|20)\d{2})/g.exec(info['Release date']), '1');
};

/**
 * @function sumGrossingValue
 *
 * @desc Sum the grossing value
 *
 * @param {Graph} graph
 * @param {string} key The key of the node
 *
 * @returns {Number}
 */
export const sumGrossingValue = (graph, key) => {
    return _(graph.connectivity(key)).map(({ value }) => value).sum();
};
