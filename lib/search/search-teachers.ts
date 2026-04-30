import { listTeachers } from "@/lib/persistence";
import type { SearchFilters } from "@/lib/types";

export async function searchTeachers(filters: SearchFilters) {
  const teachers = await listTeachers();

  return teachers.filter((teacher) => {
    if (filters.city && !teacher.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.certified && teacher.certificationStatus !== filters.certified) return false;
    if (filters.gender && teacher.gender !== filters.gender) return false;
    if (filters.style && !teacher.styles.some((style) => style.toLowerCase().includes(filters.style!.toLowerCase()))) return false;
    if (filters.date && !teacher.availability.some((slot) => !slot.isBooked && slot.startsAt.slice(0, 10) === filters.date)) return false;

    const matchingOfferings = teacher.offerings.filter((offering) => {
      if (filters.category && offering.category !== filters.category) return false;
      if (filters.length && offering.sessionLengthMin !== filters.length) return false;
      if (filters.deliveryMode && offering.deliveryMode !== filters.deliveryMode) return false;
      return true;
    });

    return matchingOfferings.length > 0;
  });
}
