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

const countMap = [];

let fieldCount;
lr.on('line', function (line) {
	const lineFields = line.split('\t');
	fieldCount = lineFields.length;
	for(var i = 0; i < lineFields.length; i++) {
		var value = lineFields[i];
		//TODO: hard coded for now
		if(value && value !== "" && value !== "north" && value !== "south" && value !== "rumba") {
			countMap[i] = !countMap[i] ? 1 : countMap[i] + 1;
		}
	}
	


});

lr.on('close', function(){
	//find to p(x) for field count
	const p = .95;
	const p_x = stats.percentile(countMap, .85);
	//remove any, including location label, (which will always be > .99, as it's the max value) outliers
	const p_bottom = stats.percentile(countMap, .99)
	console.error("cut off is: " + p_x);
	let drop_string = "";
	let accepted_count = 0;
	//find which fields are in the bottom p(x) and add them to the drop list
	for(var countKey in countMap) {
		console.error("key : " + countKey + " value : " + countMap[countKey]);
		if(countMap[countKey] <= p_x || countMap[countKey] >= p_bottom) {
			console.error("dropping: " + countKey);
			//drop_string += ((drop_string === "" ? "" : ",") + (parseInt(countKey) + 1));
		} else {
			accepted_count++;
			drop_string += ((drop_string === "" ? "" : ",") + (parseInt(countKey) + 1));
			console.error("accepted : " + countKey);
		}
	}
	let columnHeader = "";
	for(let i = 1; i <= accepted_count; i++) {
		columnHeader += columnHeader == "" ? i : ('\t' + i);
	}
	if(!options.noLocation) {
		drop_string += "," + (fieldCount);
		columnHeader += "\tlocation\n";
	} else {
		columnHeader += "\n";
	}

	console.log(drop_string);
	if(options.columnHeader) {
		fs.writeFileSync(options.columnHeader, columnHeader, 'utf8');
	}
});