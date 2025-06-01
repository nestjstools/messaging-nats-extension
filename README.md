<p align="center">
    <image src="nestjstools-logo.png" width="400">
</p>

# @nestjstools/messaging-nats-extension

A NestJS library for managing asynchronous and synchronous messages with support for buses, handlers, channels, and consumers. This library simplifies building scalable and decoupled applications by facilitating robust message handling pipelines while ensuring flexibility and reliability.

---
## Documentation

https://nestjstools.gitbook.io/nestjstools-messaging-docs

---

## Installation

```bash
npm install @nestjstools/messaging @nestjstools/messaging-nats-extension 
```

or

```bash
yarn add @nestjstools/messaging @nestjstools/messaging-nats-extension
```
## AmazonSQS Integration: Messaging Configuration Example

---

```typescript
import { Module } from '@nestjs/common';
import { MessagingModule } from '@nestjstools/messaging';
import { SendMessageHandler } from './handlers/send-message.handler';
import { MessagingNatsExtensionModule, NatsChannelConfig } from "@nestjstools/messaging-nats-extension";

@Module({
  imports: [
    MessagingNatsExtensionModule, // Importing the Nats extension module
    MessagingModule.forRoot({
      buses: [
        {
          name: 'nats-event.bus',
          channels: ['nats-event'],
        },
      ],
      channels: [
        new NatsChannelConfig({
          name: 'nats-event',
          enableConsumer: true, // Enable if you want to consume messages
        }),
      ],
      debug: true, // Optional: Enable debugging for Messaging operations
    }),
  ],
})
export class AppModule {}
```

## Dispatch messages via bus (example)

```typescript
import { Controller, Get } from '@nestjs/common';
import { CreateUser } from './application/command/create-user';
import { IMessageBus, MessageBus, RoutingMessage } from '@nestjstools/messaging';

@Controller()
export class AppController {
  constructor(
    @MessageBus('nats-event.bus') private natsMessageBus: IMessageBus,
  ) {}

  @Get('/nats')
  createUser(): string {
    this.natsMessageBus.dispatch(new RoutingMessage(new CreateUser('John FROM Nats'), 'my_app_command.create_user'));

    return 'Message sent';
  }
}
```

### Handler for your message

```typescript
import { CreateUser } from '../create-user';
import { IMessageBus, IMessageHandler, MessageBus, MessageHandler, RoutingMessage, DenormalizeMessage } from '@nestjstools/messaging';

@MessageHandler('my_app_command.create_user')
export class CreateUserHandler implements IMessageHandler<CreateUser>{

  handle(message: CreateUser): Promise<void> {
    console.log(message);
    // TODO Logic there
  }
}
```
## 📨 Communicating Beyond a NestJS Application (Cross-Language Messaging)

### To enable communication with a Handler from services written in other languages, follow these steps:

1. **Publish a Message to the queue**

2. **Include the Routing Key Header**
   Your message **must** include a header attribute named `messaging-routing-key`.
   The value should correspond to the routing key defined in your NestJS message handler:

   ```ts
   @MessageHandler('my_app_command.create_user') // <-- Use this value as the routing key
   ```

3. **You're Done!**
   Once the message is published with the correct routing key, it will be automatically routed to the appropriate handler within the NestJS application.
---

## Configuration options

### NatsChannel

#### **NatsChannelConfig**
Here's a revised and expanded version of your README section. I corrected grammar, clarified the description, and added the missing properties.

---

## Configuration Options

### NatsChannel

| **Property**         | **Description**                                                                 | **Default Value** |
| -------------------- | ------------------------------------------------------------------------------- | ----------------- |
| **`name`**           | The name of the NATS channel (e.g., `'nats-event'`).                            |                   |
| **`enableConsumer`** | Whether to enable message consumption (i.e., process incoming messages).        | `true`            |
| **`connectionUris`** | An array of NATS server URIs to connect to (e.g., `['nats://localhost:4222']`). |                   |
| **`subscriberName`** | A unique identifier for the subscriber (used in queue group subscriptions).     |                   |

---

## Real world working example with RabbitMQ & Redis - but might be helpful to understand how it works
https://github.com/nestjstools/messaging-rabbitmq-example
