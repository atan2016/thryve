import { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";
import { ContactUsModal } from "@/components/contact-us-modal";
import { getCurrentUser } from "@/lib/auth/session";
import { contactAdminAction } from "@/lib/actions";
import { getRecaptchaSiteKey } from "@/lib/recaptcha";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const canAccessTeacherDashboard = user?.role === "teacher";
  const headerUser = user ? { name: user.name, email: user.email, role: user.role } : null;
  const recaptchaSiteKey = getRecaptchaSiteKey();

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-stone-900">
      <AppHeader user={headerUser} canAccessTeacherDashboard={canAccessTeacherDashboard} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      <ContactUsModal action={contactAdminAction} siteKey={recaptchaSiteKey} user={headerUser} />
    </div>
  );
}
