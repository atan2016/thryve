/** True for `next build` / `next start` and typical production hosting; false in `next dev`. */
export const isProdBuild = process.env.NODE_ENV === "production";
