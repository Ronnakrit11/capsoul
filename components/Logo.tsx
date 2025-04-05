import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const Logo = ({ className }: Props) => {
  return (
    <Link href={"/"}>
      <Image 
        src="/logo.png" 
        alt="Fifty9 Logo"
        width={100}
        height={100}
        className={cn("w-auto h-12 object-contain", className)}
        priority
      />
    </Link>
  );
};

export default Logo;