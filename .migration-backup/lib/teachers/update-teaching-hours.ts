import type { ServiceCategory, TeachingHourCounter } from "@/lib/types";

export function updateTeachingHours(
  counters: TeachingHourCounter[],
  teacherId: string,
  category: ServiceCategory,
  minutesToAdd: number
) {
  const hoursToAdd = minutesToAdd / 60;
  const existing = counters.find((counter) => counter.teacherId === teacherId && counter.category === category);

  if (existing) {
    existing.totalHours += hoursToAdd;
    return existing;
  }

  const created: TeachingHourCounter = {
    teacherId,
    category,
    totalHours: hoursToAdd
  };

  counters.push(created);
  return created;
}
