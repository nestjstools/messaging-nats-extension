import { ChannelConfig } from '@nestjstools/messaging';

export class NatsJetStreamChannelConfig extends ChannelConfig {
  public readonly connectionUris: string[]|string;
  public readonly durableName: string;
  public readonly streamName: string;
  public readonly deliverSubjects: string[];
  public readonly consumerSubject: string;
  public readonly maxDeliver?: number;
  public readonly maxMsgs?: number;
  public readonly maxBytes?: number;

  constructor({
                connectionUris,
                name,
                enableConsumer,
                avoidErrorsForNotExistedHandlers,
                middlewares,
                normalizer,
                deliverSubjects,
                maxMsgs,
                maxBytes,
                durableName,
                streamName,
                maxDeliver,
                consumerSubject,
              }: NatsJetStreamChannelConfig) {
    super(name, avoidErrorsForNotExistedHandlers, middlewares, enableConsumer, normalizer);
    this.connectionUris = typeof connectionUris === 'string' ? [connectionUris] : connectionUris;
    this.deliverSubjects = deliverSubjects;
    this.maxMsgs = maxMsgs ?? 1000;
    this.maxBytes = maxBytes ?? 10_000_000;
    this.durableName = durableName;
    this.streamName = streamName;
    this.maxDeliver = maxDeliver;
    this.deliverSubjects = deliverSubjects;
    this.consumerSubject = consumerSubject;
  }
}
