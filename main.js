const noble = require('noble');
const fs = require('fs');
const commandLineArgs = require('command-line-args')
const path = require('path')

const optionDefinitions = [
  { name: 'output', type: String },
]
const options = commandLineArgs(optionDefinitions)

let stringBuilder = "";

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([],true);
  } else {
    noble.stopScanning();
  }
})

noble.on('error', function(error){
  console.log("ERROR: " + error);
});

let devices = {};


noble.on('discover', function(peripheral) {
  let device = devices[peripheral.address];
  if(device === undefined) {
    device = { address : peripheral.address, rssi : []};
    devices[peripheral.address] = device;
  }
  device.rssi.push(peripheral.rssi);
  stringBuilder += (Math.round(Date.now()/1000) + "\t" + peripheral.address + "\t" + peripheral.rssi);
});

setTimeout(function() {
  process.exit(1);
}, 1000*60*60); //kill after one hour, no matter what

setTimeout(() => {
  const filepath = path.join(options.output,Math.round(Date.now()/1000) + '.tsv');
  fs.writeFile(filepath, stringBuilder, 'utf8', (error) => {
    if(error) console.log('error while trying to write file : ' + error);
  });
  stringBuilder = "";
}, 1000*60); //log and clear buffer every minute  