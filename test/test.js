'use strict';
const Parser = require('../index');
const parser = new Parser();
const args = [
  '--test=1', 
  '-p', '2', 
  '--isTest', 
  '--title', '4',
  '--desc="5"',
  '--text', '"6"'
];

let result = parser.argsToObj(args);

console.assert(result['--test'] === '1', 'error 1');
console.assert(result['-p'] === '2', 'error 2');
console.assert(result['--isTest'] === true, 'error 3');
console.assert(result['--title'] === '4', 'error 4');
console.assert(result['--desc'] === '5', 'error 5');
console.assert(result['--text'] === '6', 'error 6');


parser.option('-p', 'port', Parser.Integer)
  .option('--test', parseInt)
  .option('--title')

result = parser.parse(args);
let inner = result.inner;

console.assert(inner['test'] === 1, 'error 11');
console.assert(inner['port'] === 2, 'error 12');
console.assert(inner['isTest'] === true, 'error 13');
console.assert(inner['title'] === '4', 'error 14');
console.assert(inner['desc'] === '5', 'error 15');
console.assert(inner['text'] === '6', 'error 16');

// console.log(result);
console.log('all pass');