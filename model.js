const fs = require('mz/fs');
const db = require('./db');

//读取 models 下的所有文件
var files = fs.readdirSync(__dirname + '/models');

//过滤出 .js 结尾的文件
var js_files = files.filter(f => {
    return f.endsWith('.js');
});

module.exports = {};

//模块输出所有定义 model 的模块
js_files.forEach(f => {
    console.log(`import model from file ${f}...`);
    //得到模块的名字
    var name = f.substring(0, f.length - 3);
    module.exports[name] = require(__dirname + '/models/' + name);
});

//模块输出数据库自动建表的方法，注意：这是个异步函数
module.exports.sync = async () => {
    await db.sync();
};