
const createError = require('http-errors');
const bodyParser = require('koa-bodyparser');

exports.init = app => app.use(bodyParser({
    textLimit: '32Mb',
    enableTypes: ['text'],
    // extendTypes: {
    //     json: ['application/x-javascript', 'application/json']
    // },
    onerror: (err, ctx) => {
        ctx.throw(createError(422, `body parse error: ${err.message}`));
    }
}));
