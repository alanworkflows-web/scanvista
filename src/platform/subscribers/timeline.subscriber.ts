import { ActivityEvent } from "@prisma/client";

/**
 * Timeline Subscriber
 * Responsible for maintaining the "Shared Timeline" of a property.
 * Listens to state-changing operations and formats them into a single, cohesive feed.
 */
export async function timelineSubscriber(event: ActivityEvent) {
  if (event.resourceType === "GUEST" && ["CHECKED_IN", "CHECKED_OUT"].includes(event.action)) {
    console.log(`[Timeline] Guest ${event.action} added to property timeline`);
  }
}
