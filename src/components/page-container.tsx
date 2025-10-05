import { cn } from "@/lib/utils";

type PageContainerProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export default function PageContainer({ title, className, children }: PageContainerProps) {
  return (
    <div className={cn("mx-auto max-w-7xl", className)}>
      {children}
    </div>
  );
}