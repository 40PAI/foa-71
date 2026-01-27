import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Tab {
  value: string;
  label: string;
  count?: number;
}

interface MobileTabsScrollProps {
  tabs: Tab[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function MobileTabsScroll({ tabs, value, onValueChange, className }: MobileTabsScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 10);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scrollTo = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left fade indicator */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Right fade indicator */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1 snap-x snap-mandatory"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap snap-start transition-colors shrink-0",
              value === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                value === tab.value
                  ? "bg-primary-foreground/20"
                  : "bg-muted-foreground/20"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
