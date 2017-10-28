var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true });
//callback will be passed 1 argument, line, which contains one
// line of input from stdin
module.exports = function (callback){
    function gotLine(line){
        callback(line);
        rl.removeListener("line", gotLine);
    }
    rl.on('line', gotLine);
};
