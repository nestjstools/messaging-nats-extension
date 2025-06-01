import { Global, Module } from '@nestjs/common';
import { NatsMessageBusFactory } from './message-bus/nats-message-bus-factory';
import { NatsChannelFactory } from './channel/nats-channel-factory';
import { NatsMessagingConsumer } from './consumer/nats-messaging-consumer';

@Global()
@Module({
  providers: [
    NatsMessageBusFactory,
    NatsChannelFactory,
    NatsMessagingConsumer,
  ],
})
export class MessagingNatsExtensionModule {}
