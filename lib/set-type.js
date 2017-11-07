'use strict';
module.exports = (Parser) => {
  Parser.String = (value) => {
    return value + '';
  };

  Parser.Integer = parseInt;

  Parser.Array = (v) => {
    return (v + '').split(',');
  };
};