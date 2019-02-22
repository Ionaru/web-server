import { TypedEvent } from '@ionaru/typed-events';
import { createServer, RequestListener, Server } from 'http';

export class WebServer {

    public static infoLogEvent = new TypedEvent<string>();
    public static errorLogEvent = new TypedEvent<string>();

    public server: Server;

    private readonly port: number;

    constructor(requestListener: RequestListener, port: number) {

        WebServer.infoLogEvent.emit('Creating web server');

        this.server = createServer(requestListener);
        this.port = port;

        this.server.on('error', (error) => this.serverError(error));
        this.server.on('listening', () => this.announceListening());

        this.server.listen(this.port);
    }

    /**
     * Function that is called when the server has started listening for requests.
     */
    private announceListening(): void {
        WebServer.infoLogEvent.emit(`Listening on port ${this.port}`);
        WebServer.infoLogEvent.emit('Ready for connections...');
    }

    private serverError(error: any): void {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // Handle specific listen errors with useful messages.
        switch (error.code) {
            case 'EACCES':
                WebServer.errorLogEvent.emit(`Port ${this.port} requires elevated privileges`);
                throw error;
            case 'EADDRINUSE':
                WebServer.errorLogEvent.emit(`Port ${this.port} is already in use`);
                throw error;
            default:
                throw error;
        }
    }
}
