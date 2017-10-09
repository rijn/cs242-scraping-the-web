import _ from 'lodash';

Array.prototype.iFeelLucky = function () {
    return this[_.random(0, this.length - 1)];
}
 
export const notInnerLink = (link) => link[0] !== '#';

export const isWikiDomain = (link) => link.indexOf('/wiki/') === 0;

export const isNotFunctionalPage = (link) => link.indexOf(':') === -1;

export const isActor = ($) => $.isActor
    || _.isFunction($) && $('.role').text() === 'Actor';

export const isFilm = ($) => $.isFilm
    || _.isFunction($)
        && $('table.infobox.vevent > tbody').text().indexOf('Box office') != -1;

export const completeWikiDomain = link => 'https://en.wikipedia.org' + link;

export const linkExtractor = $ => {
    var links = [];
    $('#bodyContent a').each((i, link) => {
        links.push($(link).attr('href'));
    });
    return links;
}

export const informationExtractor = ($) => {
    var result = {
        name: ($('table.infobox').first().find('tr').first().find('.fn').text()
            || $('table.infobox').first().find('tr').first().text())
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
}

export const isNumeric = s => /^-?\d+\.?\d*$/.test(s);

export const currencyParser = (s) => {
    let currency = s
        .replace(/\[.*\]/g, '')
        .replace(/\(.*\)/g, '')
        .replace(/[\d\.]*–/g, '')
        .replace('billion', '*1000000000')
        .replace('million', '*1000000')
        .replace(/ *\([^)]*\) */g, '')
        .replace(/[a-zA-Z,]/g, '')
        .replace(/\s/g, '');
    let symbol = currency.charAt(0);
    if (!isNumeric(symbol)) {
        currency = currency.split('').slice(1).join('');
    } else {
        symbol = "$";
    }
    let currencyFactor = {
        '¥': 0.15,
        '£': 1.24,
        '₤': 1.24,
        '€': 1.06,
        '$': 1,
    };
    return eval(currency) * (currencyFactor[symbol] ? currencyFactor[symbol] : 1);
}

export const grossingValueParser = (info) => {
    return _(info['Box office'])
        .split('\n')
        .compact()
        .map(currencyParser)
        .filter(n => !_.isNaN(n))
        .sum();
}

export const ageParser = (info) => {
    return _.chain(info)
        .values()
        .filter(_.isString)
        .map(s => _.get(/\(age.(\d*)\)/g.exec(s), '1'))
        .flatten()
        .compact()
        .head()
        .value();
}

export const releaseYearParser = (info) => {
    return _.get(/((19|20)\d{2})/g.exec(info['Release date']), '1');
}

export const sumGrossingValue = (graph, key) => {
    return _(graph.connectivity(key)).map(({ value }) => value).sum();
}
