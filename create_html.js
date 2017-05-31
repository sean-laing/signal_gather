const fs = require('fs');
const readline = require('readline');
const ms = require('mustache');
const stats = require('stats-lite');

const list = [];
const factor = (value, color) => {
	if(color==="red") {
		if(value < .5) return 255 - Math.floor(value * 255);
		return 0;
	}
	if(color==="green") {
		if(value >= .5) return Math.floor(value * 255);
		return 0;
	}
	return 0;
}

const zoneCount = 2;
let headers = ["north", "south"];
let currentIndex = 0;


for(let i = 0; i<zoneCount; i++) {
	list.push({
		zoneID : "_" + i,
		section : { factor : factor, frames : [] }
	});
}
let lastValue = [];

const processLine = (line) => {
	const lineFields = line.split('\t'); //assumes tabs
	for(let i = 0; i < zoneCount; i++) {
		const zone = list[i];
		let value = lineFields[i];
		lastValue.push(value);
		if(lastValue.length === 3) {
			value = stats.mean(lastValue);
			lastValue.pop();
		}
		zone.name = headers[i];
		zone.section.frames.push({
			red : zone.section.factor(value,"red"),
			green : zone.section.factor(value,"green"),
			blue : 0
		});
		
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