const fs = require('fs');
const readline = require('readline');
const ms = require('mustache');

const list = [];
const leftFactor = (value) => {
	let result = 255-value*255;
	return result > 255 ? 255 : result;
}

//each zone has 4 sections, zones are column
//number of zones is a parameter, we pull each one from
//input columns
const zoneCount = 2;
const maxIndex = process.argv[2];
let headers = ["north", "south"];
let currentIndex = 0;


for(let i = 0; i<zoneCount; i++) {
	list.push({
		zoneID : "_" + i,
		sections : [ 
			{ factor : leftFactor, frames : [], label : "100%" }
		]
	});
}



//zones are stubbed out
//read the results file
const processLine = (line) => {
	const lineFields = line.split('\t'); //assumes tabs
	for(let i = 0; i < zoneCount; i++) {
		const zone = list[i];
		zone.name = headers[i];
		for(let j = 0; j < zone.sections.length; j++) {
			let section = zone.sections[j];
			section.ID = j;
			let value = lineFields[i];
			section.frames.push({
				value : section.factor(value),
				frame : currentIndex/maxIndex * 100
			});
		}
	}
	currentIndex++;
}

const createHtml = () => {
	//call mustache
	const template = fs.readFileSync("./create_html.mustache",{encoding : "UTF8" });
	console.log(ms.render(template,{list : list}));
}

const main = () => {
	const rl = require('readline').createInterface({
	  input: process.stdin
	});
	rl.on('line', processLine);
	rl.on('close', createHtml);
}

main();