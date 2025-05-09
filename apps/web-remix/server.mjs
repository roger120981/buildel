import { installGlobals } from '@remix-run/node';
import etag from '@fastify/etag';
import helmet from '@fastify/helmet';
import { fastifyHttpProxy } from '@fastify/http-proxy';
import { fastifyStatic } from '@fastify/static';
import { createRequestHandler } from '@mcansh/remix-fastify';
import fastify from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import crypto from 'crypto';
import path from 'node:path';
import url from 'node:url';

installGlobals();

let port = process.env.PORT ? Number(process.env.PORT) || 3000 : 3000;

let vite =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );
let app = fastify();

let __dirname = url.fileURLToPath(new URL('.', import.meta.url));

if (vite) {
  process.env.PAGE_URL = `http://localhost:${port}`;

  let middie = await import('@fastify/middie').then((m) => m.default);
  await app.register(middie);
  await app.use(vite.middlewares);
} else {
  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'build', 'client', 'assets'),
    prefix: '/assets',
    wildcard: true,
    decorateReply: false,
    cacheControl: true,
    dotfiles: 'allow',
    etag: true,
    maxAge: '1y',
    immutable: true,
    serveDotFiles: true,
    lastModified: true,
  });
}

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: '/super-api/socket',
  rewritePrefix: '/socket',
  websocket: true,
});

await app.register(fastifyHttpProxy, {
  upstream: 'https://plausible.io',
  prefix: '/api/event',
  rewritePrefix: '/api/event',
});

await app.register(fastifyHttpProxy, {
  upstream: process.env.API_URL,
  prefix: '/super-api',
  rewritePrefix: '/api',
});

await app.register(fastifyHttpProxy, {
  upstream: 'https://plausible.io/js',
  prefix: '/statistics',
  rewritePrefix: '',
});

await app.register(fastifyHttpProxy, {
  upstream: 'https://www.youtube.com',
  prefix: '/youtube',
  rewritePrefix: '',
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, 'build', 'client'),
  prefix: '/',
  wildcard: false,
  cacheControl: true,
  dotfiles: 'allow',
  etag: true,
  maxAge: '1h',
  serveDotFiles: true,
  lastModified: true,
});

await app.addHook('onRequest', async (request, reply) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  request.loadContext = { cspNonce: nonce }; // add nonce to request context

  const isIframeAllowed =
    request.url.startsWith('/webchats') || request.url.startsWith('/forms');

  const csp = createCSP(nonce, isIframeAllowed);

  reply.header('Content-Security-Policy', csp);
  reply.header(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'SAMEORIGIN');
  reply.header(
    'Permissions-Policy',
    'geolocation=*, microphone=*, camera=*, fullscreen=*',
  );
  reply.header('X-XSS-Protection', '1; mode=block');
});

await app.register(helmet, {
  global: true,
  xPoweredBy: false,
  referrerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // we are setting this manually above
});

app.register(etag);

app.register(async function (childServer) {
  childServer.removeAllContentTypeParsers();
  // allow all content types
  childServer.addContentTypeParser('*', (_request, payload, done) => {
    done(null, payload);
  });

  // handle SSR requests
  childServer.all('*', async (request, reply) => {
    try {
      let handler = createRequestHandler({
        build: vite
          ? () => vite.ssrLoadModule('virtual:remix/server-build')
          : await import('./build/server/index.js'),
        getLoadContext: () => request.loadContext, // pass the context to Remix
      });
      return handler(request, reply);
    } catch (error) {
      console.error(error);
      return reply.status(500).send(error);
    }
  });
});

let address = await app.listen({ port, host: '0.0.0.0' });
console.log(`✅ app ready: ${address}`);

const metricsPort = process.env.METRICS_PORT || 3010;
let metricsApp = fastify();
await metricsApp.register(fastifyMetrics, { endpoint: '/metrics' });
const metricsAddrers = await metricsApp.listen({
  port: metricsPort,
  host: '0.0.0.0',
});
console.log(`✅ metrics ready: ${metricsAddrers}`);

// if (process.env.NODE_ENV === "development") {
//   await broadcastDevReady(initialBuild);
// }

function createCSP(nonce, isIframeAllowed) {
  let csp = `
    script-src 'self' 'nonce-${nonce}' https://www.youtube.com https://www.google.com/recaptcha/api.js;
    img-src * blob: data: 'self';
    font-src 'self' https://fonts.gstatic.com https://elpassion-design-system.s3.eu-west-1.amazonaws.com https://cdnjs.cloudflare.com;
    connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'ws:' : ''} ${process.env.API_URL} https://plausible.io;
    style-src 'unsafe-inline' 'self' https://fonts.googleapis.com;
    style-src-elem 'unsafe-inline' 'self' https://fonts.googleapis.com;
    object-src 'none';
    frame-src 'self' https://www.youtube.com https://www.google.com https://www.google.com/recaptcha/;
    base-uri 'self';
    form-action 'self' https://www.googleapis.com https://accounts.google.com https://github.com;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (isIframeAllowed) {
    csp += ' frame-ancestors *;';
  } else {
    csp += " frame-ancestors 'self';";
  }

  return csp;
}
