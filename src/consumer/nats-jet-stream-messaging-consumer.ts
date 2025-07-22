import {
  ConsumerDispatchedMessageError,
  ConsumerMessage,
  ConsumerMessageDispatcher,
  IMessagingConsumer,
  MessageConsumer,
} from '@nestjstools/messaging';
import { Injectable } from '@nestjs/common';
import { NatsJetStreamChannel } from '../channel/nats-jet-stream.channel';
import { AckPolicy, DeliverPolicy, RetentionPolicy, StorageType } from 'nats/lib/jetstream/jsapi_types';

@Injectable()
@MessageConsumer(NatsJetStreamChannel)
export class NatsJetStreamMessagingConsumer implements IMessagingConsumer<NatsJetStreamChannel> {
  private channel?: NatsJetStreamChannel = undefined;

  async consume(dispatcher: ConsumerMessageDispatcher, channel: NatsJetStreamChannel): Promise<void> {
    this.channel = channel;
    const jsm = await channel.jetStreamManager();
    const js = await channel.jetStreamClient();

    const durableName = `consumer_${channel.config.streamName}`;

    // Create stream if it doesn't exist
    try {
      await jsm.streams.info(channel.config.streamName);
    } catch {
      await jsm.streams.add({
        name: channel.config.streamName,
        subjects: channel.config.deliverSubjects,
        retention: RetentionPolicy.Workqueue,
        max_msgs: channel.config.maxMsgs,
        max_bytes: channel.config.maxBytes,
        storage: StorageType.Memory,
      });
    }

    // Create consumer if does not exists
    try {
      await jsm.consumers.add(channel.config.streamName, {
        durable_name: durableName,
        filter_subject: channel.config.consumerSubject,
        ack_policy: AckPolicy.None,
        deliver_policy: DeliverPolicy.New,
      });
    } catch (e) {
    }

    // Bind to that durable consumer
    const consumer = await js.consumers.get(channel.config.streamName, durableName);
    const messages = await consumer.consume();

    async function consumeMessages() {
      for await (const msg of messages) {
        const headers = msg.headers ?? undefined;
        const deserialized = msg.json() as object;
        await dispatcher.dispatch(new ConsumerMessage(deserialized, headers?.get('messaging-routing-key') ?? msg.subject));
      }
    }

    consumeMessages();

    return Promise.resolve();
  }

  async onError(errored: ConsumerDispatchedMessageError, channel: NatsJetStreamChannel): Promise<void> {
    return Promise.resolve();
  }
}
