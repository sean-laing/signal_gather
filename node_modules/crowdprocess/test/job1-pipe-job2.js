var test = require('tap').test;
var credentials = require('../credentials.json');
var CrowdProcess = require('..')(credentials);
var data = require('./fixtures/data');
var program = require('./fixtures/program');
var Writable = require('stream').Writable;

var N = 100;

function xtest() {}

test('pipe from one job to another', function (t) {
  var dataStream = data.generateStream(N);
  var dataSent = data.generateArray(N);
  var results = [];

  var resultStream = new Writable({ objectMode: true });
  resultStream._write = _write;
  function _write (chunk, enc, cb) {
    results.push(chunk);
    if (cb) cb();
    return true;
  }

  var job1 = CrowdProcess(program);
  var job2 = CrowdProcess(program);

  // pipe the results of job1 to job2
  dataStream
    .pipe(job1)
    .pipe(job2)
    .pipe(resultStream);

  resultStream.on('finish', function () {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataSent.sort());
    t.end();
  });
});