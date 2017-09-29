const path = require('path');
const fs = require('mz/fs');

function addControllers(router, dir) {
    //读取控制器所在目录所有文件
    var files = fs.readdirSync(path.join(__dirname, dir));
    //过滤出 .js 文件
    var js_files = files.filter(f => {
        return f.endsWith('.js');
    });
    //遍历引入控制器模块并处理 路径-方法 的映射
    js_files.forEach(f => {
        console.log(`Process controller ${f}...`);
        //引入控制器模块
        var mapping = require(path.join(__dirname, dir, f));
        //处理映射关系
        addMapping(router, mapping);
    });
}

function addMapping(router, mapping) {
    //定义跟 router 方法的映射
    //以后想要扩展方法，直接在这里加就可以了
    const methods = {
        'GET': router.get,
        'POST': router.post,
        'PUT': router.put,
        'DELETE': router.delete
    };

    //遍历 mapping，处理映射
    //mapping key 的格式:'GET /'
    Object.keys(mapping).forEach(url => {
        //用 every 方法遍历 methods
        Object.keys(methods).every((key, index, array) => {
            //如果前缀匹配就注册到 router
            var prefix = key + ' ';
            if (url.startsWith(prefix)) {
                //获取 path
                var path = url.substring(prefix.length);
                //注册到 router
                array[key].call(router, path, mapping[url]);
                console.log(`Register URL mapping: ${url}...`);
                //终止 every 循环
                return false;
            }
            //遍历到最后未能注册上时，打印出信息
            if (index == array.length - 1) {
                console.log(`invaild URL ${url}`);
            }
            //继续 every 循环
            return true;
        });
    });
}

//模块输出一个函数，dir 为控制器目录
module.exports = dir => {
    var
        dir = dir || 'controllers',
        router = require('koa-router')();
    //动态注册控制器
    addControllers(router, dir);
    return router.routes();
};