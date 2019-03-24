import Debug from 'debug';
import { createServer, RequestListener, Server } from 'http';

export class WebServer {

    public server: Server;

    private readonly port: number;
    private readonly debug = Debug('web-server');

    constructor(requestListener: RequestListener, port = 8080) {

        this.debug('Creating web-server.');

        this.port = port;
        this.server = createServer(requestListener);
    }

    public async close() {
        return new Promise((resolve, reject) => {
            this.debug(`Closing web-server.`);
            this.server.close((error: Error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    public listen() {
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
