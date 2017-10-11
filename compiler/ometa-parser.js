require('ometajs');
const parser = require('../../../bootstrap/parser.ometajs').PurrParser;

module.exports = function($platform) {
  const rt = $platform.runtime;

  rt.$module('purr.core.parser_js', ($self) => {
    rt.$public($self, ["parse_raw"]);

    rt.$method($self, "parse_raw", (text) => {
      return parser.matchAll(data, 'Program');
    });
  });
}