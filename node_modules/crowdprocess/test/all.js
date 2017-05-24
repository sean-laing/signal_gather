var test = require('tap').test;
var credentials = require('../credentials.json');
var CrowdProcess = require('..')(credentials);
var data = require('./fixtures/data');
var program = require('./fixtures/program');
var Writable = require('stream').Writable;

var N = 100;

function xtest() {}

test('all arguments, with buffering', function (t) {
  var dataArray = data.generateArray(N);
  var job = CrowdProcess(dataArray, program, onResults);

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    t.end();
  }
});

test('no buffering', function (t) {
  var dataArray = data.generateArray(N);
  var results = [];

  var job = CrowdProcess(dataArray, program);
  job.on('data', function (d) {
    results.push(d);
  });
  job.on('end', function () {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    t.end();
  });
});

test('lower level write and end', function (t) {
  var dataArray = data.generateArray(N);
  var job = CrowdProcess(program, onResults);

  dataArray.forEach(function (n) {
    job.write(dataArray[n]);
  });

  job.end();

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    t.end();
  }
});

test('data is a stream', function (t) {
  var dataStream = data.generateStream(N);
  var dataSent = data.generateArray(N);

  var job = CrowdProcess(dataStream, program, onResults);
  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataSent.sort());
    t.end();
  }
});


test('data is a stream that we pipe to job', function (t) {
  var dataStream = data.generateStream(N);
  var dataSent = data.generateArray(N);

  var job = CrowdProcess(program, onResults);

  dataStream.pipe(job);

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataSent.sort());
    t.end();
  }
});

test('no buffers at all', function (t) {
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

  // awesome oneliner!
  dataStream.pipe(CrowdProcess(program)).pipe(resultStream);

  resultStream.on('finish', function () {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataSent.sort());
    t.end();
  });
});


test('program is a string', function (t) {
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

  var program = 'function Run (d) { return d; }';

  // awesome oneliner!
  dataStream.pipe(CrowdProcess(program)).pipe(resultStream);

  resultStream.on('finish', function () {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataSent.sort());
    t.end();
  });
});