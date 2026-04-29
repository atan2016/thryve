import { bookTeacherSession } from "@/lib/store";

export async function bookSession(input: {
  customerId: string;
  teacherId: string;
  offeringId: string;
  slotId: string;
  notes?: string;
}) {
  return bookTeacherSession(input);
}
