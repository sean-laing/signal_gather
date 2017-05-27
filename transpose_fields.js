//read the columns out of stdin
//read the data out of a file
const readline = require('readline');
const fs = require('fs');

let columns = "";
const columnMap = {};
let columnsList;

const processColumnLine = (line) => {
	columns += (columns === "" ? "" : "\t") + line;
};

const mapColumns = () => {
	columnsList = columns.split("\t");
	for(let key in columnsList) {
		columnMap[columnsList[key]] = key;
	}
};


let currentTime = 0;
let currentColumn; 

const processDataLine = (line) => {
	const lineColumns = line.split("\t");
	const time = lineColumns[0];
	const macaddress = lineColumns[1];
	const value = lineColumns[2];
	const value_location = lineColumns[3];

	if(currentTime !== time && currentTime != 0) {
		let currentLine = "";
		for(let i = 0; i < columnsList.length; i++) {
			const columnValue = currentColumn[i];
			currentLine += i === 0 ? "" : "\t";
			currentLine += !columnValue ? "" : columnValue;
		}
		console.log(currentLine + "\t" + value_location);
		currentColumn = undefined; 
	}
	const location = columnMap[macaddress];
	if(!currentColumn) {
		currentColumn = Array.apply(null, Array(columnsList.length)).map(function () {});
	}
	if(location) {
		currentColumn[location] = value;
	}
	currentTime = time;
};


var processData = () => {
	const rl = require('readline').createInterface({
	  input: fs.createReadStream(process.argv[2])
	});
	rl.on("line", processDataLine);
	rl.on("close", function() {
		process.exit(0);
	});
};


var main = () => {
	const rl = require('readline').createInterface({
	  input: process.stdin
	});
	rl.on('line', processColumnLine);
	rl.on('close', function() {
		mapColumns();
		processData();
	});
}

main();