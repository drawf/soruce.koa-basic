const model = require('./model.js');

//异步可执行函数
(async () => {
    //调用 sync 方法初始化数据库
    await model.sync();
    console.log('init db ok!');
    //初始化成功后退出。这里有个坑，因为 sync 是异步函数，所以要等该函数返回再执行退出程序！
    process.exit(0);
})();