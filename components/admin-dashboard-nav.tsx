import Link from "next/link";

type AdminDashboardNavProps = {
  current: "users" | "teachers" | "bookings" | "payouts" | "content";
};

const ITEMS: Array<{ id: AdminDashboardNavProps["current"]; href: string; label: string }> = [
  { id: "users", href: "/admin/users", label: "Users" },
  { id: "teachers", href: "/admin/teachers", label: "Teachers" },
  { id: "bookings", href: "/admin/bookings", label: "Bookings" },
  { id: "payouts", href: "/admin/payouts", label: "Payouts" },
  { id: "content", href: "/admin/content", label: "Content" }
];

export function AdminDashboardNav({ current }: AdminDashboardNavProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {ITEMS.map((item) => {
        const isCurrent = item.id === current;
        return (
          <Link
            key={item.id}
            aria-current={isCurrent ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isCurrent
                ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800 hover:text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
            href={item.href}
            style={isCurrent ? { color: "#ffffff" } : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
