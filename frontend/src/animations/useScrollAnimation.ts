/**
 * useScrollAnimation.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook for imperative animation control — useful when you need
 * to trigger animations programmatically (e.g. on button click, after fetch).
 *
 * Usage:
 *   const { ref, controls } = useScrollAnimation();
 *   <motion.div ref={ref} animate={controls} variants={fadeInUp} initial="hidden">
 */

import { useEffect } from 'react';
import { useAnimation, useInView } from 'framer-motion';
import type { RefObject } from 'react';

interface UseScrollAnimationOptions {
  /** Fraction of element visible before triggering */
  threshold?: number;
  /** Trigger once (default true) */
  once?: boolean;
}

interface UseScrollAnimationReturn {
  ref: RefObject<HTMLDivElement>;
  controls: ReturnType<typeof useAnimation>;
}

export const useScrollAnimation = ({
  threshold = 0.15,
  once = true,
}: UseScrollAnimationOptions = {}): UseScrollAnimationReturn => {
  const controls = useAnimation();
  const ref = { current: null } as unknown as RefObject<HTMLDivElement>;
  const inView = useInView(ref, { once, amount: threshold });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [inView, controls, once]);

  return { ref, controls };
};
