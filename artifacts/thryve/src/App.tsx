import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell";
import { HomePage } from "@/pages/home";
import { SignInPage } from "@/pages/sign-in";
import { SignUpPage } from "@/pages/sign-up";
import { TeachersPage } from "@/pages/teachers";
import { TeacherProfilePage } from "@/pages/teacher-profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/teachers" component={TeachersPage} />
        <Route path="/teachers/:slug">
          {(params) => <TeacherProfilePage slug={params.slug} />}
        </Route>
        <Route path="/sign-in" component={SignInPage} />
        <Route path="/sign-up" component={SignUpPage} />
        <Route path="/search">
          {() => { window.location.replace("/teachers"); return null; }}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
