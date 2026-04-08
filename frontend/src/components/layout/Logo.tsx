import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`p-4 w-full bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] self-start mb-6 transition-all ${className}`}>
      <Image
        src="/logo-refidomsa.png"
        alt="Logo"
        width={140}
        height={40}
        className="h-auto w-full object-contain"
        priority
      />
    </div>
  );
}
