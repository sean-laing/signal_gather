var credentials = require('../credentials');
var CrowdProcess = require('..')(credentials);

function Run (number) {
  var isPrime = true; // assume it's prime, we'll try to disprove

  var i = number; // we'll iterate through all the numbers before it
  while (i--) {
    // every number is divisible by itself and one,
    // we don't want to divide it by zero
    if (i === 0 || i === 1 || i === number)
      continue; // continue actually means skip the rest
                // of this iteration and keep looping

    // if it's divisible by any other number
    if (!(number % i))
      isPrime = false; // then it's not a prime number
  }

  return (isPrime) ? number+' is a prime number!!!!!!!!!!!!' :
    number+' is not a prime number :(';
}

var data = [
  295075130,
  295075131,
  295075132,
  295075133,
  295075134,
  295075135,
  295075136,
  295075137,
  295075138,
  295075139,
  295075140,
  295075141,
  295075142,
  295075143,
  295075144,
  295075145,
  295075146,
  295075147,
  295075148,
  295075149,
  295075150,
  295075151,
  295075152
];

CrowdProcess(data, Run, function (results) {
  console.log(results);
});