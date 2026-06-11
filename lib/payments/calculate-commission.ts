export const PLATFORM_COMMISSION_RATE = 0.2;

export function calculateCommission(grossCredits: number) {
  const platformCommission = Math.round(grossCredits * PLATFORM_COMMISSION_RATE);
  const netCredits = grossCredits - platformCommission;

  return {
    grossCredits,
    platformCommission,
    netCredits
  };
}
