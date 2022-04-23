import { IncomingMessage, ServerResponse } from 'http';

import axios from 'axios';
import Debug from 'debug';

import { WebServer } from './index';

class FakeSystemError extends Error {
    public constructor(
        public readonly message: string,
        public readonly syscall: string,
        public readonly code: string,
    ) {
        super(message);
    }
}

describe('web-server tests', () => {

    let webServer: WebServer | undefined;

    afterEach(() => {
        webServer?.close().catch(() => {/* Empty */});
        jest.restoreAllMocks();
    });

    it('can activate a simple web server', async () => {
        expect.assertions(1);
        webServer = new WebServer(() => {/* Empty */});
        webServer.server.on('listening', () => webServer?.close().then());
        await expect(webServer.listen()).resolves.toBeUndefined();
    });

    it('can receive and respond to a request', async () => {
        expect.assertions(3);

        const data = 'Hello!';

        webServer = new WebServer((request: IncomingMessage, response: ServerResponse) => {
            expect(request).toBeTruthy();
            response.write(data);
            response.end();
        }, 3000);

        await webServer.listen();

        const webResponse = await axios.get('http://localhost:3000');
        expect(webResponse.status).toBe(200);
        expect(webResponse.data).toStrictEqual(data);
    });

    it('uses 8080 by default', async () => {
        expect.assertions(3);

        webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        await webServer.listen();
        expect(debugSpy).toHaveBeenNthCalledWith(1, `Starting listener on port 8080.`);
        expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port 8080.`);
        expect(debugSpy).toHaveBeenCalledTimes(3);
    });

    it('emits announcement on listening', async () => {
        expect.assertions(1);

        webServer = new WebServer(() => {/* Empty */});
        const listeningSpy = jest.spyOn<WebServer, any>(webServer, 'announceListening');
        await webServer.listen();
        expect(listeningSpy).toHaveBeenCalledWith();
    });

    it('announces port on listening', async () => {
        expect.assertions(3);

        const port = 5555;
        webServer = new WebServer(() => {/* Empty */}, port);

        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        await webServer.listen();
        expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port ${port}.`);
        expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');
        expect(debugSpy).toHaveBeenCalledTimes(3);
    });

    it('can log to debug', async () => {
        expect.assertions(2);

        const debug = Debug('test');
        webServer = new WebServer(() => {/* Empty */}, undefined, debug);

        const debugSpy = jest.spyOn<any, any>(webServer, 'debug');
        await webServer.listen();
        expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');
        expect(debugSpy).toHaveBeenCalledTimes(3);
    });

    it('can listen and close async', async () => {
        expect.assertions(2);

        webServer = new WebServer(() => {/* Empty */});

        await expect(webServer.listen()).resolves.toBeUndefined();
        await expect(webServer.close()).resolves.toBeUndefined();
    });

    it('handles EADDRINUSE errors', async () => {
        expect.assertions(3);

        webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const systemError = new FakeSystemError('Port in use', 'listen', 'EADDRINUSE');

        await webServer.listen();
        expect(() => {
            webServer?.server.emit('error', systemError);
        }).toThrow('Port in use');
        expect(debugSpy).toHaveBeenNthCalledWith(4, 'Port 8080 is already in use.');
        expect(debugSpy).toHaveBeenCalledTimes(4);
    });

    it('handles EACCES errors', async () => {
        expect.assertions(3);

        webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const systemError = new FakeSystemError('Port need admin', 'listen', 'EACCES');

        await webServer.listen();
        expect(() => {
            webServer?.server.emit('error', systemError);
        }).toThrow('Port need admin');
        expect(debugSpy).toHaveBeenNthCalledWith(4, 'Port 8080 requires elevated privileges.');
        expect(debugSpy).toHaveBeenCalledTimes(4);
    });

    it('handles other system errors', async () => {
        expect.assertions(2);

        webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const fakeError = new FakeSystemError('Exists', 'listen', 'EEXIST');

        await webServer.listen();
        expect(() => {
            webServer?.server.emit('error', fakeError);
        }).toThrow('Exists');
        expect(debugSpy).toHaveBeenCalledTimes(3);
    });

    it('handles other errors', async () => {
        expect.assertions(2);

        webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const fakeError = new Error('Unknown error');

        await webServer.listen();
        expect(() => {
            webServer?.server.emit('error', fakeError);
        }).toThrow('Unknown error');
        expect(debugSpy).toHaveBeenCalledTimes(3);
    });

    it('rejects closing the server twice', async () => {
        expect.assertions(2);

        webServer = new WebServer(() => {/* Empty */});

        await webServer.listen();
        await expect(webServer?.close()).resolves.toBeUndefined();
        await expect(webServer?.close()).rejects.toThrow('Server is not running.');
    });

});
