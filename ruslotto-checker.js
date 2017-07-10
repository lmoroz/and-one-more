'use strict';

const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('kcors');
const path = require('path');
const fs = require('fs');
const pick = require('lodash/pick');
const createError = require('http-errors');
const koaRequest = require('koa-http-request');

const app = new Koa();

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => {
    require(`./handlers/${handler}`).init(app);
});

app.use(cors({ allowMethods: 'GET,HEAD,POST' }));

async function setDrawCacheId(ctx, next) {
  const seekDraw = ctx.params.draw;
  ctx.params.cacheName = 'ruslotto'+seekDraw+'.html';
  console.log('ctx.params.cacheName = ',ctx.params.cacheName);
  await next();
  ctx.body += ' got from setDrawCacheId()';
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
  .get('/data/:draw', setDrawCacheId, async ctx => {
      try {
          const seekDraw = ctx.params.draw;
          ctx.body = 'Get data for the draw № '+seekDraw;

//           if (!('OFFERS' in jjConfig) || !Array.isArray(jjConfig.OFFERS))
//               ctx.throw(createError(422, 'OFFERS array required'));
// 
//           const resJson = jjConfig.OFFERS.map((offer) => {
//               const offerShort = pick(offer, ['NAME', 'DISPLAY_PROPERTIES']);
//               offerShort.DETAIL_PICTURE = pick(offer.DETAIL_PICTURE, ['SRC']);
//               offerShort.SLIDER = offer.SLIDER.map(sliderItem => pick(sliderItem, ['SRC']));
//               return offerShort;
//           });
// 
//           ctx.body = {OFFERS: resJson};
      }
      catch (e) {
          ctx.throw(createError(422, 'Draw number required'));
      }
  })
  .post('/check', async ctx => {
      try {
          const ticketData = JSON.parse(ctx.request.body);

          if (!('tickets' in ticketData) || !Array.isArray(ticketData.tickets))
              ctx.throw(createError(422, 'Tickets numbers array required'));

          const resJson = tickeData.numbers.map((number) => {
              const offerShort = pick(offer, ['NAME', 'DISPLAY_PROPERTIES']);
              offerShort.DETAIL_PICTURE = pick(offer.DETAIL_PICTURE, ['SRC']);
              offerShort.SLIDER = offer.SLIDER.map(sliderItem => pick(sliderItem, ['SRC']));
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


