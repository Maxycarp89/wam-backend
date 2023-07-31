function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

console.log(Math.floor(getRandomArbitrary(1000, 15000)));
console.log(Math.floor(getRandomArbitrary(1000, 10000)));
console.log(Math.floor(getRandomArbitrary(10000, 25000)));
console.log(Math.floor(getRandomArbitrary(25000, 35000)));
console.log(Math.floor(getRandomArbitrary(35000, 50000)));
 