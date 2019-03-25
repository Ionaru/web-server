import { get, IncomingMessage, ServerResponse } from 'http';

import { WebServer } from './index';

test('WebServer can activate a simple web server', () => {
    const webServer = new WebServer(() => {/* Empty */});
    webServer.server.on('listening', () => webServer.close().then());
    webServer.listen().then();
});

test('WebServer can receive and respond to a request', (done) => {
    const webServer = new WebServer((request: IncomingMessage, response: ServerResponse) => {
        expect(request).toBeTruthy();
        response.end();
    }, 3000);

    webServer.server.on('listening', () => {
        get('http://localhost:3000', () => {
            webServer.close().then();
            done();
        });
    });

    webServer.listen().then();
});

test('WebServer uses 8080 by default', (done) => {
    const webServer = new WebServer(() => {/* Empty */});
    const debugSpy = jest.spyOn<any, any>(WebServer, 'debug');
    webServer.listen().then(() => {
        expect(debugSpy).toHaveBeenNthCalledWith(1, `Creating listener on port 8080.`);

        debugSpy.mockRestore();
        webServer.close().then();
        done();
    });
});

test('WebServer emits announcement on listening', (done) => {
    const webServer = new WebServer(() => {/* Empty */});
    const listeningSpy = jest.spyOn<WebServer, any>(webServer, 'announceListening');
    webServer.listen().then(() => {
        expect(listeningSpy).toHaveBeenCalled();

        listeningSpy.mockRestore();
        webServer.close().then();
        done();
    });
});

test('WebServer announces port on listening', (done) => {
    const port = 5555;
    const webServer = new WebServer(() => {/* Empty */}, port);

    const debugSpy = jest.spyOn<any, any>(WebServer, 'debug');
    webServer.listen().then(() => {
        expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port ${ port }.`);
        expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');

        debugSpy.mockRestore();
        webServer.close().then();
        done();
    });
});
