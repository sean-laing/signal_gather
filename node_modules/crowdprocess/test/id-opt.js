var test = require('tap').test;
var credentials = require('../credentials.json');
var CrowdProcess = require('..')(credentials);
var data = require('./fixtures/data');
var program = require('./fixtures/program');
var Writable = require('stream').Writable;

var N = 3;
function xtest() {}

var jobId;

test('create and compute', function (t) {
  var dataArray = data.generateArray(N);
  var job = CrowdProcess(dataArray, program, onResults);

  job.on('created', function (id) {
    jobId = id;
  });

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    t.end();
  }
});

test('create and compute', function (t) {
  var dataArray = data.generateArray(N);
  var job = CrowdProcess({
    data: dataArray,
    id: jobId,
    onResults: onResults
  });

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    t.end();
  }
});