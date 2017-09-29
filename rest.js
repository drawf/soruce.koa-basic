//模块输出为一个 json 对象
module.exports = {
    //定义 APIError 对象
    APIError: function (code, message) {
        //错误代码命名规范为 大类:子类
        this.code = code || 'internal:unknown_error';
        this.message = message || '';
    },
    //初始化 restify 中间件的方法
    restify: pathPrefix => {
        //处理请求路径的前缀
        pathPrefix = pathPrefix || '/api/';
        //返回 app.use() 要用的异步函数
        return async (ctx, next) => {
            var rpath = ctx.request.path;
            //如果前缀请求的是 api
            if (rpath.startsWith(pathPrefix)) {
                ctx.rest = data => {
                    ctx.response.type = 'application/json';
                    ctx.response.body = data;
                };
                try {
                    //尝试捕获后续中间件抛出的错误
                    await next();
                } catch (e) {
                    //捕获错误后的处理
                    ctx.response.status = 400;
                    ctx.response.type = 'application/json';
                    ctx.response.body = {
                        code: e.code || 'internal:unknown_error',
                        message: e.message || '',
                    };
                }
            } else {
                await next();
            }
        };
    }
};