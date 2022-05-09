

function getSmallest() {
    let x = 20;
    while (x < 2000000000) {
        
        let result = testNumber(x);
        //console.log(result);
        if (result)
            return x;

        x++;
    }
    return x;
}

function testNumber(num) {
    //check num is divisible by all numbers 1-20
    for (let x=11; x<=20; x++) {
        if ((num/x) % 1 != 0)
            return false;
    }
    return true;
}

const start = Date.now();

console.log('starting timer...');
  
console.log(getSmallest());

const millis = Date.now() - start;
console.log(millis);