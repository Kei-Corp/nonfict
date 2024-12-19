const fs = require('fs');
const Benchmark = require('benchmark');
const { spawnSync } = require('child_process');
const suite = new Benchmark.Suite;

console.log(spawnSync('rg', ['さア、', 'nngnskk']).output[1].toString());

suite
    .add('ripgrep', {
        fn: () => {
            spawnSync('rg', ['さア、', 'nngnskk']).output[1].toString();
        }
    })
    .add('js', {
        fn: () => {
            fs.readFileSync("nngnskk", 'utf-8').split('\n').map(s => s.indexOf("さア、"))
        }
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .run({ async: true });