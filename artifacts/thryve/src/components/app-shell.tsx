import { type ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { ContactUsModal } from "@/components/contact-us-modal";
import { useAuth } from "@/lib/auth-context";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="mt-16 border-t border-stone-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img alt="Thryve" className="h-7 w-auto" src="/assets/images/thryve-wellness-logo.png" />
              <span className="text-sm text-stone-500">Bay Area wellness platform</span>
            </div>
            <p className="text-xs text-stone-400">© {new Date().getFullYear()} Thryve. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <ContactUsModal user={user ? { name: user.name, email: user.email } : null} />
    </div>
  );
}
