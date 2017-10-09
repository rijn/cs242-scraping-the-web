export const notInnerLink = (link) => link[0] !== '#';

export const isWikiDomain = (link) => link.indexOf('/wiki/') === 0;

export const isNotFunctionalPage = (link) => link.indexOf(':') === -1;

export const isActor = ($) => $('.role').text() === 'Actor';

export const isFilm = ($) => $('table.infobox.vevent > tbody')
    .text().indexOf('Box office') != -1;

export const completeWikiDomain = link => 'https://en.wikipedia.org' + link;

export const informationExtractor = ($) => {
    var result = {
        name: $('table.infobox').first().find('tr').first()
            .text().replace(/\n/g, ''),
        img: $('table.infobox').first().find('img')
            .first().attr('src')
    };
    $('table.infobox').first().find('tr').each((i, c) => {
        let key = $(c).children('th').text();
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
