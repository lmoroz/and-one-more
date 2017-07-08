exports.init = app => app.use(async (ctx, next) => {
    try {
        await next();
    }
    catch (e) {
        if (e.status && e.message) {
            ctx.status = e.status;
            ctx.body = e.message;
        }
        else if (e.name === 'ValidationError') {
      // const errors = e.errors.map((err, id) => ({
      //   err:
      // }));

            ctx.status = 400;
            ctx.body = {ValidationError: e.errors};
        }
        else {
            ctx.status = 500;
            ctx.body = 'Internal server error';
            console.error(e.message, e.stack);
        }
    }
});
