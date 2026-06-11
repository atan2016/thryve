import { Link, useLocation } from "wouter";
import { TeacherCard } from "@/components/teacher-card";
import { searchTeachers } from "@/lib/mock-data";
import { serviceCategoryLabels } from "@/lib/mock-data";
import type { SearchFilters } from "@/lib/types";

const categoryOptions = Object.entries(serviceCategoryLabels).map(([value, label]) => ({ value, label }));

export function TeachersPage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const filters: SearchFilters = {
    category: (searchParams.get("category") as SearchFilters["category"]) || undefined,
    style: searchParams.get("style") || undefined,
    certified: (searchParams.get("certified") as SearchFilters["certified"]) || undefined,
    gender: (searchParams.get("gender") as SearchFilters["gender"]) || undefined,
    deliveryMode: (searchParams.get("deliveryMode") as SearchFilters["deliveryMode"]) || undefined,
    date: searchParams.get("date") || undefined,
    city: searchParams.get("city") || undefined
  };

  const teachers = searchTeachers(filters);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      }
    }
    navigate(`/teachers?${params.toString()}`);
  }

  function handleReset() {
    navigate("/teachers");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Find a yoga teacher</h1>
            <p className="mt-2 text-stone-500">Search by category, style, certification, gender, format, and location.</p>
          </div>
        </div>
        <form className="mt-6 grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Category</span>
            <select defaultValue={filters.category ?? ""} name="category">
              <option value="">All categories</option>
              {categoryOptions.map((option) => (
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
            <button
              className="rounded-full border border-stone-300 px-5 py-3"
              type="button"
              onClick={handleReset}
            >
              Reset filters
            </button>
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
