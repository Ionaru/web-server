# @ionaru/web-server

[![npm version](https://img.shields.io/npm/v/@ionaru/web-server.svg?style=for-the-badge)](https://www.npmjs.com/package/@ionaru/web-server)
[![npm version](https://img.shields.io/npm/v/@ionaru/web-server/next.svg?style=for-the-badge)](https://www.npmjs.com/package/@ionaru/web-server/v/next)
[![Build Status](https://img.shields.io/travis/Ionaru/web-server/master.svg?style=for-the-badge)](https://travis-ci.org/Ionaru/web-server)
[![codecov](https://img.shields.io/codecov/c/github/Ionaru/web-server/master.svg?style=for-the-badge)](https://codecov.io/gh/Ionaru/web-server)

## Description
A package for creating a simple web server.

## Usage
```
npm install @ionaru/web-server
```

### Standard http
```js
new WebServer((request, response) => {
    // Handle request
}).listen();
```

### Express
```js
const expressApplication = express();

expressApplication.use('/', (request, response) => {
    // Handle request
});

new WebServer(expressApplication).listen();
```

### Separate listening call
```js
const webServer = new WebServer((request, response) => {}, 3000);

// Accessed through the exposed Node.js Server instance.
webServer.server.on('listening', () => {/* Custom on-listening code */});
webServer.listen();
```

## Examples
### WebServer.prototype.server
The created http.Server instance is exposed in the WebServer instance.
```typescript
const myServer = new WebServer((request, response) => {}, 3000).listen();
myServer.server.address();
```

### WebServer.prototype.close() (async)
An promisified version of the standard `.close(callback)`
```js
const myServer = new WebServer((request, response) => {}, 3000).listen();
await myServer.close();
```

The promise will emit an error when the server was not open when closed.
```js
const myServer = new WebServer((request, response) => {}, 3000).listen();
await myServer.close().catch((error) => {
    // handle error
});
```
