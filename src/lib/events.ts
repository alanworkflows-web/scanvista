import { PrismaClient, ActivityEvent, ResourceType, ActionType, EventSource, EventOutcome, RetentionCategory } from "@prisma/client";

const prisma = new PrismaClient();

import { analyticsSubscriber } from "../platform/subscribers/analytics.subscriber";
import { timelineSubscriber } from "../platform/subscribers/timeline.subscriber";
import { notificationSubscriber } from "../platform/subscribers/notification.subscriber";

// Definition for subscribers
export type EventSubscriber = (event: ActivityEvent) => Promise<void>;
const subscribers: EventSubscriber[] = [
  analyticsSubscriber,
  timelineSubscriber,
  notificationSubscriber
];

export function subscribeToEvents(subscriber: EventSubscriber) {
  subscribers.push(subscriber);
}

export interface LogEventParams {
  organizationId: string;
  propertyId?: string;
  actorId?: string;
  correlationId?: string;
  
  resourceType: ResourceType;
  resourceId?: string;
  action: ActionType;
  
  source?: EventSource;
  outcome?: EventOutcome;
  retention?: RetentionCategory;
  
  metadata?: any;
  ipAddress?: string;
  device?: string;
}

export async function logEvent(params: LogEventParams): Promise<ActivityEvent> {
  // 1. Store
  const event = await prisma.activityEvent.create({
    data: {
      organizationId: params.organizationId,
      propertyId: params.propertyId,
      actorId: params.actorId,
      correlationId: params.correlationId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      action: params.action,
      source: params.source || "API",
      outcome: params.outcome || "SUCCESS",
      retention: params.retention || "AUDIT",
      metadata: params.metadata || {},
      ipAddress: params.ipAddress,
      device: params.device,
    }
  });

  // Traceability: Print event ID to application logs
  console.log(`[EVENT] id=${event.id} action=${event.action} resource=${event.resourceType} outcome=${event.outcome}`);

  // 2. Publish (fire and forget to not block the main request thread)
  publishEvent(event).catch(err => {
    console.error("Failed to publish event to subscribers:", err);
  });

  return event;
}

async function publishEvent(event: ActivityEvent) {
  // 3. Subscribers execute sequentially or in parallel
  const promises = subscribers.map(sub => sub(event).catch(err => {
    console.error("Subscriber error for event", event.id, err);
  }));
  await Promise.all(promises);
}
