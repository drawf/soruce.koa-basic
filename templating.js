const nunjucks = require('nunjucks');

//配置nunjucks
function createEnv(path, opts) {
    var
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path, {
                noCache: noCache,
                watch: watch
            })
            , {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            }
        );

    if (opts.filters) {
        for (var f of opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

//模块输出为一个函数 path为可选参数
module.exports = function (path, opts) {
    //可选参数处理
    if (arguments.length === 1) {
        opts = path;//赋值给 opts
        path = null;
    }
    //模版文件目录，默认为 views
    path = path || 'views';
    var env = createEnv(path, opts);
    //用于 app.use() 的中间件函数
    return async (ctx, next) => {
        //给 ctx 绑定 render 方法
        ctx.render = (view, model) => {
            ctx.response.type = 'text/html';
            //Object.assign()会把除第一个参数外的其他参数的所有属性复制到第一个参数中。第二个参数是ctx.state || {}，这个目的是为了能把一些公共的变量放入ctx.state并传给View。
            ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
        };
        await next();
    };
};