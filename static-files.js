const path = require('path');
const mime = require('mime');
//mz 提供的 API 和 Node.js 的 fs 模块完全相同，但 fs 模块使用回调，而 mz 封装了 fs 对应的函数，并改为 Promise，这样我们就可以非常简单的用 await 调用 mz 的函数，而不需要任何回调。
const fs = require('mz/fs');

//模块输出为一个函数
module.exports = (pathPrefix, dir) => {
    //指定请求的前缀，默认为 static
    pathPrefix = pathPrefix || '/static/';
    //指定静态文件目录，默认为 static
    dir = dir || __dirname + '/static/';
    //返回异步函数，这是用于 app.use() 的中间件函数
    return async (ctx, next) => {
        //请求路径
        var rpath = ctx.request.path;
        //判断请求路径前缀符合要求，否则执行下一个中间件
        if (rpath.startsWith(pathPrefix)) {
            //转换到文件的本地路径
            var fp = path.join(dir, rpath.substring(pathPrefix.length));
            //判断文件存在，并返回相关内容
            if (await fs.exists(fp)) {
                ctx.response.type = mime.getType(rpath);
                ctx.response.body = await fs.readFile(fp);
            } else {
                ctx.response.status = 404;
            }
        } else {
            await next();
        }
    };
};
