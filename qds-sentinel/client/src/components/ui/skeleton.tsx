import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-atelier bg-accent/40 rounded-sm", className)}
      {...props}
    />
  );
}

export function SkeletonKpiGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-kpi-card skeleton-atelier">
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line skeleton-line-metric" />
          <div className="skeleton-line skeleton-line-sub" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row skeleton-atelier">
          <div className="skeleton-line" style={{ width: "80%" }} />
          <div className="skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-line" style={{ width: "90%" }} />
          <div className="skeleton-line" style={{ width: "65%" }} />
          <div className="skeleton-line" style={{ width: "50%" }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChartBox() {
  return (
    <div className="skeleton-chart-box skeleton-atelier">
      <div className="skeleton-line" style={{ width: "40%", height: "14px" }} />
      <div className="skeleton-line" style={{ width: "100%", height: "130px", marginTop: "10px" }} />
      <div className="skeleton-line" style={{ width: "60%", height: "10px", marginTop: "6px" }} />
    </div>
  );
}

export { Skeleton };
