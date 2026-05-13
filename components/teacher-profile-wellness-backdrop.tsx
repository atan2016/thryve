/** Soft abstract backdrop (waves, glows, leaves) for teacher profile wellness layout. */
export function TeacherProfileWellnessBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div className="absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-[#fdba8c]/45 blur-3xl" />
      <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute right-1/4 top-1/2 h-48 w-48 rounded-full bg-emerald-200/35 blur-2xl" />
      <svg className="absolute right-[6%] top-8 w-[min(42%,18rem)] text-teal-800/10" fill="none" viewBox="0 0 220 140">
        <path d="M0 95C36 72 72 118 108 95s72-46 108-23" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
        <path d="M12 108C48 85 84 128 120 105s72-40 96-18" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.6" strokeWidth="2" />
        <path d="M140 18c8 12 12 24 8 38-6 22-28 32-44 20" stroke="currentColor" strokeLinecap="round" strokeOpacity="0.45" strokeWidth="1.8" />
      </svg>
      <svg className="absolute bottom-10 left-[8%] w-32 text-emerald-700/15" fill="none" viewBox="0 0 120 100">
        <path
          d="M60 8c-4 18-22 32-28 52 8-6 18-10 28-12 10 2 20 6 28 12-6-20-24-34-28-52z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M20 70c12-8 28-6 40 4M88 66c10 8 22 10 32 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    </div>
  );
}
