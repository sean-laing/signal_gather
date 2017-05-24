var credentials = require('./credentials');
var CrowdProcess = require('..')(credentials);

// the program
function Run (d) {
  return d*2;
}

// a data array
var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


CrowdProcess(data, Run, onResults);

function onResults (results) {
  console.log('got all', results.length, 'results:', results);
}
