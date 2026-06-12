import Link from "next/link";

import { TeacherCard } from "@/components/teacher-card";
import { searchTeachers } from "@/lib/search/search-teachers";
import { getServiceOptions } from "@/lib/store";
import type { SearchFilters } from "@/lib/types";

type TeachersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TeachersPage({ searchParams }: TeachersPageProps) {
  const params = await searchParams;
  const filters: SearchFilters = {
    category: typeof params.category === "string" ? (params.category as SearchFilters["category"]) : undefined,
    style: typeof params.style === "string" ? params.style : undefined,
    length: typeof params.length === "string" ? Number(params.length) : undefined,
    certified: typeof params.certified === "string" ? (params.certified as SearchFilters["certified"]) : undefined,
    gender: typeof params.gender === "string" ? (params.gender as SearchFilters["gender"]) : undefined,
    deliveryMode: typeof params.deliveryMode === "string" ? (params.deliveryMode as SearchFilters["deliveryMode"]) : undefined,
    date: typeof params.date === "string" ? params.date : undefined,
    city: typeof params.city === "string" ? params.city : undefined
  };
  const teachers = await searchTeachers(filters);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Find a yoga teacher</h1>
            <p className="mt-2 text-stone-500">Search by category, style, session length, certification, gender, format, and availability.</p>
          </div>
          <Link className="rounded-full border border-stone-300 px-4 py-2 text-sm" href="/search">
            Open search route
          </Link>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Category</span>
            <select defaultValue={filters.category ?? ""} name="category">
              <option value="">All categories</option>
              {getServiceOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Style</span>
            <input defaultValue={filters.style ?? ""} name="style" placeholder="Vinyasa, Yin..." />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Length</span>
            <select defaultValue={filters.length?.toString() ?? ""} name="length">
              <option value="">Any</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Certified</span>
            <select defaultValue={filters.certified ?? ""} name="certified">
              <option value="">Any</option>
              <option value="certified">Certified</option>
              <option value="not_certified">Not certified</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Gender</span>
            <select defaultValue={filters.gender ?? ""} name="gender">
              <option value="">Any</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Delivery mode</span>
            <select defaultValue={filters.deliveryMode ?? ""} name="deliveryMode">
              <option value="">Any</option>
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Date</span>
            <input defaultValue={filters.date ?? ""} name="date" type="date" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">City</span>
            <input defaultValue={filters.city ?? ""} name="city" placeholder="San Francisco" />
          </label>
          <div className="md:col-span-4 flex flex-wrap gap-3">
            <button className="rounded-full bg-stone-900 px-5 py-3 text-white" type="submit">
              Search teachers
            </button>
            <Link className="rounded-full border border-stone-300 px-5 py-3" href="/teachers">
              Reset filters
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">{teachers.length} teachers match the current filters.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
        {teachers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
            No teachers match the current search. Try removing one or more filters.
          </div>
        ) : null}
      </section>
    </div>
  );
}
