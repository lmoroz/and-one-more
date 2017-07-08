'use strict';
const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const path = require('path');
const fs = require('fs');
const pick = require('lodash/pick');
const createError = require('http-errors');

const app = new Koa();

const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => {
    require(`./handlers/${handler}`).init(app);
});

app.use(cors({ allowMethods: 'GET,HEAD,POST' }));

const router = new Router({
    prefix: '/api'
})
  .get('/help/:draw', async ctx => {
      try {
          ctx.body = 'Get help for draw №';
      }
      catch (e) {
          ctx.throw(createError(422, 'OFFERS array required'));
      }
  })
  .get('/data/:draw', async ctx => {
      try {
          const jjConfig = eval(`new Object(${ctx.request.body})`);

          if (!('OFFERS' in jjConfig) || !Array.isArray(jjConfig.OFFERS))
              ctx.throw(createError(422, 'OFFERS array required'));

          const resJson = jjConfig.OFFERS.map((offer) => {
              const offerShort = pick(offer, ['NAME', 'DISPLAY_PROPERTIES']);
              offerShort.DETAIL_PICTURE = pick(offer.DETAIL_PICTURE, ['SRC']);
              offerShort.SLIDER = offer.SLIDER.map(sliderItem => pick(sliderItem, ['SRC']));
              return offerShort;
          });

          ctx.body = {OFFERS: resJson};
      }
      catch (e) {
          ctx.throw(createError(422, 'OFFERS array required'));
      }
  })
  .post('/check', async ctx => {
      try {
          const ticketData = eval(`new Object(${ctx.request.body})`);

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

module.exports = app;
