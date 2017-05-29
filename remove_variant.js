const fs = require('fs');
const stats = require("stats-lite");


const optionDefinitions = [
  { name: 'columnHeader', type: String },
  { name: 'noLocation', type:Boolean }
];
const commandLineArgs = require('command-line-args')
const options = commandLineArgs(optionDefinitions);

const lr = require('readline').createInterface({
  input: fs.createReadStream(process.argv[2])
});

const fieldValues = [];
let headersProcessed = false;
const processHeaders = (line) => {
    if(headersProcessed) return;
    headersProcessed = true;
    var headers = line.split('\t');
    for(let i = 0; i < headers.length; i++) {
        if(headers[i] === 'location') continue;
        fieldValues.push([]);
    }
}

lr.on('line', function (line) {
    processHeaders(line);
    var values = line.split('\t');
    for(let i = 0; i < values.length; i++) {
        if(fieldValues[i] === undefined) continue;
        const value = parseInt(values[i],10);
        if(value === "" || value === undefined) value = -200;
        fieldValues[i].push(value);
    }
});

lr.on('close', function(){
    const summaries = [];
    for(let i = 0; i < fieldValues.length; i++) {
        const variance = stats.variance(fieldValues[i]);
        const stdev = stats.stdev(fieldValues[i]);
        const mean = stats.mean(fieldValues[i]);
        console.log("variance : " + variance);
        console.log("stdev : " + stdev);
        console.log("mean : " + mean);
        console.log("%stdev by mean : " + stdev / mean)    }
});