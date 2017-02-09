'use strict';

var cheerio = require('cheerio');

module.exports = function wikipediaHeadingParser(html) {
  var $ = cheerio.load(html);
  var tags = $('#mw-content-text').contents();
  var nodes = [];

  for (let i = 0; i < tags.length; i += 1) {
    let tag = tags[i];
    if (tag.name === 'div' && (tag.attribs.id === 'toc' || (tag.attribs.class && tag.attribs.class.startsWith('toc', 0)))) {
      break;
    }
    if (tag.name === 'p') {
      $(tag).find('a').each(function() {
        if (this.attribs.href.startsWith('/', 0)) {
          let source = this.attribs.href.split('#').shift();
          nodes.push({
            name: source.split('/').pop().toLowerCase().replace(/_/g, ' ').trim(),
            source: 'https://en.wikipedia.org' + source,
          });
        }
      });
    }
  }

  return nodes;
};
