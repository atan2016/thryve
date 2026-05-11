import Image from "next/image";

type TeacherAvatarProps = {
  name: string;
  src?: string;
  className: string;
  width: number;
  height: number;
  sizes?: string;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function TeacherAvatar({ name, src, className, width, height, sizes }: TeacherAvatarProps) {
  if (src) {
    if (src.startsWith("blob:")) {
      return <Image alt={name} className={`${className} object-cover`} height={height} sizes={sizes} src={src} unoptimized width={width} />;
    }

    return <Image alt={name} className={`${className} object-cover`} height={height} sizes={sizes} src={src} width={width} />;
  }

  return (
    <div
      aria-label={`${name} profile placeholder`}
      className={`${className} flex items-center justify-center bg-emerald-100 font-semibold text-emerald-800`}
      role="img"
    >
      <span className="text-[0.35em] tracking-[0.08em]">{getInitials(name)}</span>
    </div>
  );
}
