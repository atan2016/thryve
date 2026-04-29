import { searchTeachers as searchTeachersInStore } from "@/lib/store";
import type { SearchFilters } from "@/lib/types";

export function searchTeachers(filters: SearchFilters) {
  return searchTeachersInStore(filters);
}
