'use strict';

const config      = require('config');
const Koa         = require('koa');
const Router      = require('koa-router');
const cors        = require('kcors');
const path        = require('path');
const fs          = require('fs');
const pick        = require('lodash/pick');
const createError = require('http-errors');
const axios       = require('axios');

const app = new Koa();

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => {
  require(`./handlers/${handler}`).init(app);
});

const aDay   = 1000 * 60 * 60 * 24;
const aWeek  = aDay * 7;
const aMonth = aDay * 30;
const aYear  = aDay * 336;
app.use(cors({allowMethods: 'GET,HEAD,POST', maxAge: aYear}));

async function setDrawCacheId ( ctx, next ) {
  const seekDraw       = ctx.params.draw;
  ctx.params.cacheName = 'ruslotto' + seekDraw + '.html';
  console.log(`ctx.params.cacheName = ${ctx.params.cacheName}`);
  await next();
  ctx.body += "\r\ngot from setDrawCacheId()";
}

async function getRuslottoDraw ( ctx, next ) {
  try {
    const drawUrl = `https://m.stoloto.ru/ruslotto/archive/${ctx.params.draw}`;
    console.log(`drawUrl = ${drawUrl}; getRuslottoDraw() drawID = ${ctx.params.draw}`);
    let drawHTML = await axios.get(drawUrl, {responseType: 'document', timeout: 5000});
    ctx.body     = drawHTML.data;
  }
  catch (e) {
    console.error(e);
    ctx.throw(createError(404, `Не удалось скачать данные о тираже № ${ctx.params.draw} Русского лото`));
  }
}

const router = new Router({
                            prefix: '/api'
                          })
  .get('/help', async ctx => {
    try {
      ctx.body = 'Get help for the app';
    }
    catch (e) {
      ctx.throw(createError(422, 'Unknown error'));
    }
  })
  .get('/data/:draw', setDrawCacheId, getRuslottoDraw, async ctx => {
  })
  .post('/check', async ctx => {
    try {
      const ticketData = JSON.parse(ctx.request.body);

      if (!( 'tickets' in ticketData ) || !Array.isArray(ticketData.tickets))
        ctx.throw(createError(422, 'Tickets numbers array required'));

      const resJson = tickeData.numbers.map(( number ) => {
        const offerShort          = pick(offer, [ 'NAME', 'DISPLAY_PROPERTIES' ]);
        offerShort.DETAIL_PICTURE = pick(offer.DETAIL_PICTURE, [ 'SRC' ]);
        offerShort.SLIDER         = offer.SLIDER.map(sliderItem => pick(sliderItem, [ 'SRC' ]));
        return offerShort;
      });

      ctx.body = {result: resJson};
    }
    catch (e) {
      ctx.throw(createError(422, 'Tickets numbers array required'));
    }
  });

app.use(router.routes());


app.listen(config.get('port'), config.get('host'), () => console.log(`http://${config.get('host')}:${config.get('port')}/`));


