import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to reveal elements on scroll using Intersection Observer
 * Returns a ref to attach to the element and a boolean indicating visibility
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Hook to reveal multiple elements with staggered delays
 */
export function useStaggeredReveal(
  count: number,
  options: UseScrollRevealOptions = {}
): [RefObject<HTMLDivElement>, boolean[]] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    Array(count).fill(false)
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the reveals
          visibleItems.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const next = [...prev];
                next[index] = true;
                return next;
              });
            }, index * 100);
          });
          if (triggerOnce) {
            observer.unobserve(container);
          }
        } else if (!triggerOnce) {
          setVisibleItems(Array(count).fill(false));
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [count, threshold, rootMargin, triggerOnce, visibleItems.length]);

  return [containerRef, visibleItems];
}

/**
 * Hook to track scroll position for navigation effects
 */
export function useScrollPosition(): {
  scrollY: number;
  isScrolled: boolean;
  scrollDirection: 'up' | 'down' | null;
} {
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return {
    scrollY,
    isScrolled: scrollY > 20,
    scrollDirection,
  };
}

/**
 * Hook for parallax scroll effects
 */
export function useParallax(speed: number = 0.5): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elementTop = element.offsetTop;
      const offset = (scrollY - elementTop) * speed;
      element.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return ref;
}
