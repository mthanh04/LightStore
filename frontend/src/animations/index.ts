/**
 * animations/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single entry-point for the entire animation system.
 *
 * Import everything from one place:
 *
 *   import Reveal from '@/animations';
 *   import { Reveal, fadeInUp, staggerContainer } from '@/animations';
 *   import type { VariantKey, RevealProps } from '@/animations';
 */

// ── Primary components & hooks ────────────────────────────────────────────────
export { default as Reveal } from './Reveal';
export { useScrollAnimation } from './useScrollAnimation';

// ── All variant objects ───────────────────────────────────────────────────────
export {
  // Leaf variants (used directly on elements)
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  zoomIn,
  zoomInSpring,
  flipInX,
  slideInFromBottom,
  // Stagger orchestration
  staggerContainer,
  staggerContainerSlow,
  staggerItem,
  staggerItemZoom,
  // Map & transition helpers
  VARIANT_MAP,
  TRANSITION_BASE,
  TRANSITION_SPRING,
} from './variants';

// ── Types ─────────────────────────────────────────────────────────────────────
export type { VariantKey } from './variants';
export type { RevealProps } from './Reveal';

// ── Default export — most common usage ───────────────────────────────────────
export { default } from './Reveal';
