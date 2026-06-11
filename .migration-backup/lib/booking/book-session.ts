import { bookTeacherCalendarSession, bookTeacherSession } from "@/lib/store";
import { getTeacherCalendarSession, incrementTeachingHoursInDb, markTeacherCalendarSessionBooked } from "@/lib/persistence";

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

export async function bookCalendarSession(input: {
  customerId: string;
  teacherId: string;
  sessionId: string;
  notes?: string;
}) {
  const session = await getTeacherCalendarSession(input.teacherId, input.sessionId);

  if (!session || session.isBooked) {
    throw new Error("That calendar session is no longer available.");
  }

  const { booking, teachingHoursPersist } = bookTeacherCalendarSession({
    customerId: input.customerId,
    teacherId: input.teacherId,
    offeringId: session.offeringId,
    sessionId: session.id,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    notes: input.notes
  });

  await markTeacherCalendarSessionBooked(input.teacherId, input.sessionId);
  await incrementTeachingHoursInDb(
    teachingHoursPersist.teacherId,
    teachingHoursPersist.category,
    teachingHoursPersist.minutesAdded
  );

  return booking;
}
