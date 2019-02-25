import { get, IncomingMessage, ServerResponse } from 'http';

import { WebServer } from './index';

test('WebServer can activate a simple web server', () => {
    const webServer = new WebServer(() => {/* Empty */}, 0);
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

test('WebServer emits announcement on listening', (done) => {
    const webServer = new WebServer(() => {/* Empty */}, 0);
    webServer.infoLogEvent.on((message) => {
        expect(message).toBeTruthy();
        if (message === 'Ready for connections...') {
            webServer.close().then();
            done();
        }
    });
    webServer.listen().then();
});

test('WebServer announces port on listening', (done) => {
    const port = 5555;
    const webServer = new WebServer(() => {/* Empty */}, port);

    webServer.infoLogEvent.on((message) => {
        expect(message).toBeTruthy();
        if (message === `Listening on port ${port}`) {
            webServer.close().then();
            done();
        }
    });
    webServer.listen().then();
});

// NOTE: Test for error handling does not function, question asked in Discord about it:
//  https://discordapp.com/channels/102860784329052160/103622435865104384/549337299209682989

// test('WebServer emits errorLogEvent when port is already in use', (done) => {
//     const port = 6001;
//
//     const webServer1 = new WebServer(() => {/* Empty */}, port);
//     webServer1.server.on('listening', () => {
//
//         // Start second web server on the same port.
//         const webServer2 = new WebServer(() => {/* Empty */}, port);
//         webServer2.errorLogEvent.on((message) => {
//
//             expect(message).toBeTruthy();
//             if (message === `Port ${port} is already in use`) {
//                 webServer1.close().then();
//                 done(); // This gets called.
//             }
//         });
//
//         webServer2.listen().then().catch();
//     });
//
//     webServer1.listen().then();
// });
