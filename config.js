const defaultConfig = './config-default.js';//默认配置
const overrideConfig = './config-override.js';//线上配置，自动覆盖其他配置
const testConfig = './config-test.js';

const fs = require('mz/fs');

var config = null;
if (process.env.NODE_ENV === 'test') {
    console.log(`Load ${testConfig}...`);
    config = require(testConfig);
} else {
    console.log(`Load ${defaultConfig}...`);
    config = require(defaultConfig);
    try {
        //如果线上配置存在，就是覆盖默认配置
        if (fs.statSync(overrideConfig).isFile) {
            console.log(`Load ${overrideConfig}...`);
            config = require(overrideConfig);
        }
    } catch (e) {
        console.log(`Cannot load ${overrideConfig}...`);
    }
}

module.exports = config;