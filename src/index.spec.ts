/* eslint-disable jest/no-done-callback */
import { get, IncomingMessage, ServerResponse } from 'http';

import { WebServer } from './index';

describe('web-server tests', () => {
    it('can activate a simple web server', async () => {
        expect.assertions(1);
        const webServer = new WebServer(() => {/* Empty */});
        webServer.server.on('listening', () => webServer.close().then());
        await expect(webServer.listen()).resolves.toBeUndefined();
    });

    it('can receive and respond to a request', async (done) => {
        expect.assertions(2);

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

        await expect(webServer.listen()).resolves.toBeUndefined();
    });

    it('uses 8080 by default', (done) => {
        expect.assertions(1);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'debug');
        webServer.listen().then(() => {
            expect(debugSpy).toHaveBeenNthCalledWith(1, `Creating listener on port 8080.`);

            debugSpy.mockRestore();
            webServer.close().then();
            done();
        });
    });

    it('emits announcement on listening', (done) => {
        expect.assertions(1);

        const webServer = new WebServer(() => {/* Empty */});
        const listeningSpy = jest.spyOn<WebServer, any>(webServer, 'announceListening');
        webServer.listen().then(() => {
            expect(listeningSpy).toHaveBeenCalledWith();

            listeningSpy.mockRestore();
            webServer.close().then();
            done();
        });
    });

    it('announces port on listening', (done) => {
        expect.assertions(2);

        const port = 5555;
        const webServer = new WebServer(() => {/* Empty */}, port);

        const debugSpy = jest.spyOn<any, any>(webServer, 'debug');
        webServer.listen().then(() => {
            expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port ${ port }.`);
            expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');

            debugSpy.mockRestore();
            webServer.close().then();
            done();
        });
    });

    it('can listen and close async', async () => {
        expect.assertions(2);

        const webServer = new WebServer(() => {/* Empty */});

        await expect(webServer.listen()).resolves.toBeUndefined();
        await expect(webServer.close()).resolves.toBeUndefined();
    });

});
