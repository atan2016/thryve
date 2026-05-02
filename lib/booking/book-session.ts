import { bookTeacherSession } from "@/lib/store";
import { incrementTeachingHoursInDb } from "@/lib/persistence";

export async function bookSession(input: {
  customerId: string;
  teacherId: string;
  offeringId: string;
  slotId: string;
  notes?: string;
}) {
  const { booking, teachingHoursPersist } = bookTeacherSession(input);
  await incrementTeachingHoursInDb(
    teachingHoursPersist.teacherId,
    teachingHoursPersist.category,
    teachingHoursPersist.minutesAdded
  );
  return booking;
}
