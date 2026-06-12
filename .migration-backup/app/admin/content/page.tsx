import { AdminDashboardAccessCard } from "@/components/admin-dashboard-access-card";
import { AdminDashboardNav } from "@/components/admin-dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { updateAdminContentFiltersAction } from "@/lib/actions";
import { getAdminDashboardContext } from "@/lib/admin-dashboard";
import { getAdminContentFilters, listHomepageLocalGigs } from "@/lib/persistence";

type AdminContentPageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const context = await getAdminDashboardContext();
  const params = await searchParams;

  if (context.status === "signed_out") {
    return <AdminDashboardAccessCard state="signed_out" />;
  }

  if (context.status === "wrong_role") {
    return <AdminDashboardAccessCard state="wrong_role" userName={context.user.name} />;
  }

  const filters = await getAdminContentFilters();
  const visibleJobs = await listHomepageLocalGigs();
  const feedbackMessage =
    params.saved === "filters"
      ? "Content filters updated."
      : params.error === "update_failed"
        ? "We couldn't save the content filters."
        : null;
  const feedbackTone = params.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Admin: content</h1>
          <p className="mt-2 text-stone-500">Hide homepage event and job cards by keyword without deleting the underlying records.</p>
        </div>
        <AdminDashboardNav current="content" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Hidden event keywords" value={filters.hiddenEventKeywords.length} />
        <MetricCard label="Hidden job keywords" value={filters.hiddenJobKeywords.length} />
        <MetricCard label="Visible homepage jobs" value={visibleJobs.length} />
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Keyword filters</h2>
          <p className="mt-1 text-sm text-stone-500">
            Enter one keyword per line. A card is hidden when any keyword matches its title, host, company, location, detail, or related text.
          </p>
        </div>

        {feedbackMessage ? <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${feedbackTone}`}>{feedbackMessage}</div> : null}

        <form action={updateAdminContentFiltersAction} className="mt-6 grid gap-6 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Hide events with these keywords</span>
            <textarea
              className="min-h-48"
              defaultValue={filters.hiddenEventKeywords.join("\n")}
              name="eventKeywords"
              placeholder={"college of san mateo\nteacher training"}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Hide jobs with these keywords</span>
            <textarea
              className="min-h-48"
              defaultValue={filters.hiddenJobKeywords.join("\n")}
              name="jobKeywords"
              placeholder={"retreat\nremote"}
            />
          </label>

          <div className="lg:col-span-2">
            <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white" type="submit">
              Save filters
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
