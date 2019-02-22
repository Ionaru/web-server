# @ionaru/web-server

## Description
A package for creating a simple webserver

## Usage
```
npm install @ionaru/web-server
```

### Standard http
```js
new WebServer((request, response) => {
    // Handle request
}, 3000);
```

### Express
```js
const expressApplication = express();

expressApplication.use('/', (request, response) => {
    // Handle request
});

new WebServer(expressApplication, 3000);
```

## Logging
This package exposes log levels as events so you can pipe them to your favourite log handler

```js
// Full-size
WebServer.errorLogEvent.on((message) => {
    console.error(message);
});

// Shorthand
WebServer.infoLogEvent.on(console.log);

new WebServer((request, response) => {}, 3000);
```

## API
The created http.Server instance is exposed as `WebServer.server`
```js
const myServer = new WebServer((request, response) => {}, 3000);
myServer.server.close()
```
