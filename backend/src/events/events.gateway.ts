import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
// import { DemoController } from '../../scripts/demo-controller'; // To be created

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  // private demoController: DemoController;

  constructor() {
    // this.demoController = new DemoController(this.server);
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection_established', { message: 'NightWatch Agent Connected' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trigger_demo')
  handleDemoTrigger(client: Socket, payload: { scenario: string }): void {
    this.logger.log(`Demo triggered by ${client.id}: ${payload.scenario}`);
    // this.demoController.trigger(payload.scenario);
  }

  /**
   * Broadcasts an event to all connected clients.
   * @param event The event name.
   * @param data The data to send.
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
