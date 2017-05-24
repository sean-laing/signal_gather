const noble = require('noble');
const stats = require("stats-lite");

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

const devices = {};


noble.on('discover', function(peripheral) {
  const device = devices[peripheral.address];
  if(device === undefined) {
    device = { address : peripheral.address, rssi : []};
    devices[peripheral.address] = device;
  }
  device.rssi.push(peripheral.rssi);
  console.log(Math.round(Date.now()/1000) + "\t" + peripheral.address + "\t" + peripheral.rssi);
});

setTimeout(function() {
  process.exit(1);
},1000*60*60); //gather data for one hour