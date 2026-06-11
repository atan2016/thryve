export const BOOKING_ENABLED = false;
export const isProdBuild = import.meta.env.PROD;

export const serviceCategoryLabels: Record<string, string> = {
  studio: "Studio",
  private: "Private",
  "corporate-events": "Corporate / events",
  kids: "Kids",
  older: "Older"
};

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "G-MN4JZXPBV6";
