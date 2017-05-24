var credentials = require('../credentials');
var CrowdProcess = require('..')(credentials);
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;

// the program
function Run(d) {
  return d;
}

// input stream for the program
var data = new Readable({objectMode: true});
var n = 110;
data._read = function _read () {
  if (--n) {
    data.push({ n: n, d : Date.now() });
  } else {
    data.push(null);
  }
};

// results stream
var results = new Writable({objectMode: true});
results.write = function write (chunk, encoding, cb) {
  console.log('got result:', chunk);
  if (cb)
    cb();
  return true;
};


// awesome oneliner!
data.pipe(CrowdProcess(Run)).pipe(results);