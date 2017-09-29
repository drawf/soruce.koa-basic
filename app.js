// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const templating = require('./templating');
//直接引入初始化的方法
const restify = require('./rest').restify;
const controller = require('./controller');

// 创建一个Koa对象表示web app本身:
const app = new Koa();
// 生产环境上必须配置环境变量 NODE_ENV = 'production'
const isProduction = process.env.NODE_ENV === 'production';

//中间件1:计算响应耗时
app.use(async (ctx, next) => {
    console.log(`Precess ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = Date.now(),
        ms;
    await next();// 调用下一个中间件（等待下一个异步函数返回）
    ms = Date.now() - start;
    ctx.response.set('X-Response-Time', `${ms}ms`);
    console.log(`Response Time: ${ms}ms`);
});

//中间件2:处理静态资源，非生产环境下使用
if (!isProduction) {
    //引入 static-files 中间件，直接调用该模块输出的方法
    app.use(require('./static-files')());
}

//中间件3:解析原始 request 对象 body，绑定到 ctx.request.body
app.use(bodyparser());

//中间件4:模版文件渲染
app.use(templating({
    noCache: !isProduction,
    watch: !isProduction
}));

//中间件5:REST API 中间件
app.use(restify());

//中间件6:动态注册控制器
app.use(controller());

// 在端口3000监听:
app.listen(3000);
console.log('app started at port 3000...');