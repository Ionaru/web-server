/* eslint-disable jest/no-done-callback */
import { get, IncomingMessage, ServerResponse } from 'http';

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
            get('http://localhost:3000', async () => {
                await webServer.close();
                done();
            });
        });

        await expect(webServer.listen()).resolves.toBeUndefined();
    });

    it('uses 8080 by default', (done) => {
        expect.assertions(3);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        webServer.listen().then(async () => {
            expect(debugSpy).toHaveBeenNthCalledWith(1, `Creating listener on port 8080.`);
            expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port 8080.`);
            expect(debugSpy).toHaveBeenCalledTimes(3);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('emits announcement on listening', (done) => {
        expect.assertions(1);

        const webServer = new WebServer(() => {/* Empty */});
        const listeningSpy = jest.spyOn<WebServer, any>(webServer, 'announceListening');
        webServer.listen().then(async () => {
            expect(listeningSpy).toHaveBeenCalledWith();

            listeningSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('announces port on listening', (done) => {
        expect.assertions(3);

        const port = 5555;
        const webServer = new WebServer(() => {/* Empty */}, port);

        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        webServer.listen().then(async () => {
            expect(debugSpy).toHaveBeenNthCalledWith(2, `Listening on port ${port}.`);
            expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');
            expect(debugSpy).toHaveBeenCalledTimes(3);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('can log to debug', (done) => {
        expect.assertions(2);

        const debug = Debug('test');
        const webServer = new WebServer(() => {/* Empty */}, undefined, debug);

        const debugSpy = jest.spyOn<any, any>(webServer, 'debug');
        // eslint-disable-next-line sonarjs/no-identical-functions
        webServer.listen().then(async () => {
            expect(debugSpy).toHaveBeenNthCalledWith(3, 'Ready for connections...');
            expect(debugSpy).toHaveBeenCalledTimes(3);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('can listen and close async', async () => {
        expect.assertions(2);

        const webServer = new WebServer(() => {/* Empty */});

        await expect(webServer.listen()).resolves.toBeUndefined();
        await expect(webServer.close()).resolves.toBeUndefined();
    });

    it('handles EADDRINUSE errors', (done) => {
        expect.assertions(3);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const systemError = new FakeSystemError('Port in use', 'listen', 'EADDRINUSE');

        webServer.listen().then(async () => {
            expect(() => {
                webServer.server.emit('error', systemError);
            }).toThrow('Port in use');
            expect(debugSpy).toHaveBeenNthCalledWith(4, 'Port 8080 is already in use.');
            expect(debugSpy).toHaveBeenCalledTimes(4);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('handles EACCES errors', (done) => {
        expect.assertions(3);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const systemError = new FakeSystemError('Port need admin', 'listen', 'EACCES');

        webServer.listen().then(async () => {
            expect(() => {
                webServer.server.emit('error', systemError);
            }).toThrow('Port need admin');
            expect(debugSpy).toHaveBeenNthCalledWith(4, 'Port 8080 requires elevated privileges.');
            expect(debugSpy).toHaveBeenCalledTimes(4);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('handles other system errors', (done) => {
        expect.assertions(2);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const fakeError = new FakeSystemError('Exists', 'listen', 'EEXIST');

        webServer.listen().then(async () => {
            expect(() => {
                webServer.server.emit('error', fakeError);
            }).toThrow('Exists');
            expect(debugSpy).toHaveBeenCalledTimes(3);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('handles other errors', (done) => {
        expect.assertions(2);

        const webServer = new WebServer(() => {/* Empty */});
        const debugSpy = jest.spyOn<any, any>(webServer, 'log');
        const fakeError = new Error('Unknown error');

        webServer.listen().then(async () => {
            expect(() => {
                webServer.server.emit('error', fakeError);
            }).toThrow('Unknown error');
            expect(debugSpy).toHaveBeenCalledTimes(3);

            debugSpy.mockRestore();
            await webServer.close();
            done();
        });
    });

    it('rejects closing the server twice', (done) => {
        expect.assertions(2);

        const webServer = new WebServer(() => {/* Empty */});

        webServer.listen().then(async () => {
            await expect(webServer.close()).resolves.toBeUndefined();
            await expect(webServer.close()).rejects.toThrow('Server is not running.');
            done();
        });
    });

});
