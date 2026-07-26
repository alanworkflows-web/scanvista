import { ActivityEvent } from "@prisma/client";

/**
 * Notification Subscriber
 * Responsible for routing critical events to SMS, Email, or Push Notification gateways.
 */
export async function notificationSubscriber(event: ActivityEvent) {
  // Silent coordination: only notify when absolute action is required.
  if (event.resourceType === "GUEST" && event.action === "CHECKED_IN") {
    // Determine if guest is VIP (would require checking DB or metadata)
    if (event.metadata && (event.metadata as any).isVip) {
      console.log(`[Notification] Routing VIP arrival SMS to General Manager`);
    }
  }
}
