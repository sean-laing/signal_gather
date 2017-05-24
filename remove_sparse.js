const fs = require('fs');
const stats = require("stats-lite");

const lr = require('readline').createInterface({
  input: fs.createReadStream(process.argv[2])
});

const countMap = [];

lr.on('line', function (line) {
	const lineFields = line.split('\t');
	for(var i = 0; i < lineFields.length; i++) {
		var value = lineFields[i];
		if(value && value !== "" && (value > -80 || typeof value == "string") ) {
			countMap[i] = !countMap[i] ? 1 : countMap[i] + 1;
		}
	}
	


});

lr.on('close', function(){
	//find to p(x) for field count
	const p = .95;
	const p_x = stats.percentile(countMap, p);

	console.error("cut off is: " + p_x);
	let drop_string = "";
	//find which fields are in the bottom p(x) and add them to the drop list
	for(var countKey in countMap) {
		console.error("key : " + countKey + " value : " + countMap[countKey]);
		if(countMap[countKey] >= p_x) {
			//console.error("dropping: " + countKey);
			drop_string += ((drop_string === "" ? "" : ",") + (parseInt(countKey) + 1));
		} else {
			//console.error("accepted : " + countKey);
		}
	}
	console.log(drop_string);
});