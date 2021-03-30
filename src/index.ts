import { createServer, RequestListener, Server } from 'http';

import { Debugger } from 'debug';

/**
 * Class of a Web Server.
 */
export class WebServer {

    /**
     * Exposed instance of the Node.js Server.
     */
    public server: Server;

    private readonly debug?: Debugger;
    private readonly port: number;

    /**
     * Create the Web Server.
     * @param {RequestListener} requestListener - A function or module that can handle requests.
     * @param {number} port - The port the Web Server will listen on.
     * @param {Debugger} debug - A Debugger instance to log debug output to.
     */
    public constructor(requestListener: RequestListener, port = 8080, debug?: Debugger) {

        this.debug = debug ? debug.extend(this.constructor.name) : debug;
        this.log('Creating web-server.');

        this.port = port;
        this.server = createServer(requestListener);
    }

    /**
     * Stop the Web Server from accepting new connections.
     */
    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.log(`Closing web-server.`);
            this.server.close((error?: Error) => error ? reject(error) : resolve());
        });
    }

    /**
     * Starts the Web Server listening for connections.
     */
    public listen(): Promise<void> {
        return new Promise((resolve) => {
            this.server.on('error', (error) => this.serverError(error));
            this.log(`Starting listener on port ${this.port}.`);
            this.server.listen(this.port, () => {
                this.announceListening();
                resolve();
            });
        });
    }

    /**
     * Function that is called when the server has started listening for requests.
     */
    private announceListening(): void {
        this.log(`Listening on port ${ this.port }.`);
        this.log('Ready for connections...');
    }

    /**
     * Function that is called when the server has encountered an error at any time.
     */
    private serverError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // Handle specific listen errors with useful messages.
        switch (error.code) {
            case 'EACCES':
                this.log(`Port ${ this.port } requires elevated privileges.`);
                throw error;
            case 'EADDRINUSE':
                this.log(`Port ${ this.port } is already in use.`);
                throw error;
            default:
                throw error;
        }
    }

    private log(message: string): void {
        if (this.debug) {
            this.debug(message);
        }
    }
}
