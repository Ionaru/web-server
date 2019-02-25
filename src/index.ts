import { TypedEvent } from '@ionaru/typed-events';
import { createServer, RequestListener, Server } from 'http';

export class WebServer {

    public infoLogEvent = new TypedEvent<string>();
    public errorLogEvent = new TypedEvent<string>();

    public server: Server;

    private readonly port: number;

    constructor(requestListener: RequestListener, port: number) {

        this.infoLogEvent.emit('Creating web server');

        this.port = port;
        this.server = createServer(requestListener);
    }

    public async close() {
        return new Promise((resolve, reject) => {
            this.server.close((error: Error) => {
                return error ? reject(error) : resolve();
            });
        });
    }

    public listen() {
        return new Promise((resolve) => {
            this.server.on('error', (error) => this.serverError(error));
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
        this.infoLogEvent.emit(`Listening on port ${ this.port }`);
        this.infoLogEvent.emit('Ready for connections...');
    }

    private serverError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // Handle specific listen errors with useful messages.
        switch (error.code) {
            case 'EACCES':
                this.errorLogEvent.emit(`Port ${ this.port } requires elevated privileges`);
                throw error;
            case 'EADDRINUSE':
                this.errorLogEvent.emit(`Port ${ this.port } is already in use`);
                throw error;
            default:
                throw error;
        }
    }
}
