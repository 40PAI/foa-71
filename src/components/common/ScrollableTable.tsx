import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollableTableProps {
  children: React.ReactNode;
  maxHeight?: string;
  minHeight?: string;
  showScrollIndicators?: boolean;
  className?: string;
}

export function ScrollableTable({
  children,
  maxHeight = "600px",
  minHeight = "200px",
  showScrollIndicators = true,
  className
}: ScrollableTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !showScrollIndicators) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrollable = scrollHeight > clientHeight;
      setHasScroll(isScrollable);
      setShowTopIndicator(scrollTop > 20);
      setShowBottomIndicator(scrollTop + clientHeight < scrollHeight - 20);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [showScrollIndicators]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          "scrollable-table-container",
          hasScroll && "has-scroll",
          className
        )}
        style={{ maxHeight, minHeight }}
      >
        {children}
      </div>
      
      {showScrollIndicators && showTopIndicator && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-20" />
      )}
      
      {showScrollIndicators && showBottomIndicator && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20" />
      )}
    </div>
  );
}
