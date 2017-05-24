const fs = require('fs');
const readline = require('readline');
const ms = require('mustache');

const list = [];
const leftFactor = (value) => {
	let result = 255-value*255;
	return result > 255 ? 255 : result;
}
const middleLeftFactor = (value) => {
	let result = 255-value*.5*255;
	return result > 255 ? 255 : result;
}
const middleRightFactor = (value) => {
	let result = 255-(1-value)*.5*255;
	return result > 255 ? 255 : result;
}
const rightFactor = (value) => {
	let result = 255-(1-value)*255;
	return result > 255 ? 255 : result;
}

//each zone has 4 sections, zones are column
//number of zones is a paramter, we pull each one from
//input columns
const zoneCount = process.argv[2];
const maxIndex = process.argv[3];
let headers = [];
let currentIndex = 0;


for(let i = 0; i<zoneCount; i++) {
	list.push({
		zoneID : "_" + i,
		sections : [ 
			{ factor : leftFactor, frames : [], label : "100%" },
			{ factor : middleLeftFactor, frames : [], label : "" },
			{ factor : middleRightFactor, frames : [], label : "" },
			{ factor : rightFactor, frames : [], lable : "0%" }
		]
	});
}



//zones are stubbed out
//read the results file
const processLine = (line) => {
	const lineFields = line.split('\t'); //assumes tabs
	if(headers.length == 0) {
		headers = lineFields;
		return;
	}
	for(let i = 0; i < zoneCount; i++) {
		const zone = list[i];
		zone.name = headers[i];
		for(let j = 0; j < zone.sections.length; j++) {
			let section = zone.sections[j];
			section.ID = j;
			section.frames.push({
				value : section.factor(lineFields[i]),
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