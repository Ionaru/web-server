import Debug from 'debug';
import { createServer, RequestListener, Server } from 'http';

/**
 * Class of a Web Server.
 */
export class WebServer {

    /**
     * Exposed instance of the Node.js Server.
     */
    public server: Server;

    private readonly port: number;
    private readonly debug = Debug('web-server');

    /**
     * Create the Web Server.
     * @param {RequestListener} requestListener - A function or module that can handle requests.
     * @param {number} port - The port the Web Server will listen on.
     */
    constructor(requestListener: RequestListener, port = 8080) {

        this.debug('Creating web-server.');

        this.port = port;
        this.server = createServer(requestListener);
    }

    /**
     * Stop the Web Server from accepting new connections.
     */
    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.debug(`Closing web-server.`);
            this.server.close((error: Error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    /**
     * Starts the Web Server listening for connections.
     */
    public listen(): Promise<void> {
        return new Promise((resolve) => {
            this.server.on('error', (error) => this.serverError(error));
            this.debug(`Creating listener on port ${this.port}.`);
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
        this.debug(`Listening on port ${ this.port }.`);
        this.debug('Ready for connections...');
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
                this.debug(`Port ${ this.port } requires elevated privileges.`);
                throw error;
            case 'EADDRINUSE':
                this.debug(`Port ${ this.port } is already in use.`);
                throw error;
            default:
                throw error;
        }
    }
}
