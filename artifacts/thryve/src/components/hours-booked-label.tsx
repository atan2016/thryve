import { useState } from "react";

type HoursBookedLabelProps = {
  teacherName: string;
  hours: number;
};

export function HoursBookedLabel({ teacherName, hours }: HoursBookedLabelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span
      className="relative inline-flex cursor-help"
      onBlur={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      tabIndex={0}
      title={`${teacherName} has ${hours} hours booked using this platform`}
    >
      <span>{`${hours} hours booked`}</span>
      {isOpen ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-64 -translate-x-1/2 rounded-lg bg-stone-900 px-3 py-2 text-xs normal-case tracking-normal text-white shadow-lg">
          {`${teacherName} has ${hours} hours booked using this platform`}
        </span>
      ) : null}
    </span>
  );
}
