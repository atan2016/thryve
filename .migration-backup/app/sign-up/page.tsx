import { SignUpForm } from "@/components/sign-up-form";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
    status?: string;
    email?: string;
    name?: string;
    role?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    profileImportConsent?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const nextPath = params.next ?? "";
  const error = params.error;
  const status = params.status;
  const defaultEmail = params.email ?? "";
  const defaultName = params.name ?? "";
  const defaultRole = params.role === "teacher" ? "teacher" : "customer";
  const defaultWebsiteUrl = params.websiteUrl ?? "";
  const defaultLinkedinUrl = params.linkedinUrl ?? "";
  const defaultInstagramUrl = params.instagramUrl ?? "";
  const defaultFacebookUrl = params.facebookUrl ?? "";
  const defaultProfileImportConsent = params.profileImportConsent === "1";
  const errorMessage =
    error === "sign_up_failed" ? "We couldn't start signup. Please try again." : null;
  const successMessage =
    status === "verification_sent"
      ? `We sent a verification link to ${defaultEmail || "your email"}. Your account will be created after you confirm it.`
      : null;

  return (
    <SignUpForm
      defaultEmail={defaultEmail}
      defaultFacebookUrl={defaultFacebookUrl}
      defaultInstagramUrl={defaultInstagramUrl}
      defaultLinkedinUrl={defaultLinkedinUrl}
      defaultName={defaultName}
      defaultProfileImportConsent={defaultProfileImportConsent}
      defaultRole={defaultRole}
      defaultWebsiteUrl={defaultWebsiteUrl}
      errorMessage={errorMessage}
      nextPath={nextPath}
      successMessage={successMessage}
    />
  );
}
