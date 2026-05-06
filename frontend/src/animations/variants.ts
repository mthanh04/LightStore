/**
 * animations.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Framer Motion variant definitions.
 * All variants follow the same interface: { hidden, visible }
 * so they can be swapped into any <Reveal> without changes.
 */
import type { Variants } from 'framer-motion';

// ── Shared transition defaults ────────────────────────────────────────────────
export const TRANSITION_BASE = {
  duration: 0.55,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // easeOutQuart
};

export const TRANSITION_SPRING = {
  type: 'spring' as const,
  stiffness: 80,
  damping: 18,
};

// ── Variant: fadeInUp ─────────────────────────────────────────────────────────
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

// ── Variant: fadeInDown ───────────────────────────────────────────────────────
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

// ── Variant: fadeInLeft ───────────────────────────────────────────────────────
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITION_BASE,
  },
};

// ── Variant: fadeInRight ──────────────────────────────────────────────────────
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITION_BASE,
  },
};

// ── Variant: zoomIn ───────────────────────────────────────────────────────────
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_BASE,
  },
};

// ── Variant: zoomInSpring ─────────────────────────────────────────────────────
export const zoomInSpring: Variants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_SPRING,
  },
};

// ── Variant: flipInX ─────────────────────────────────────────────────────────
export const flipInX: Variants = {
  hidden: { opacity: 0, rotateX: -90 },
  visible: {
    opacity: 1,
    rotateX: 0,
    transition: { ...TRANSITION_BASE, duration: 0.7 },
  },
};

// ── Variant: fadeIn (simple opacity only) ────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { ...TRANSITION_BASE, duration: 0.7 },
  },
};

// ── Variant: slideInFromBottom (stronger travel) ──────────────────────────────
export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_SPRING,
  },
};

// ── Variant: staggerContainer ────────────────────────────────────────────────
// Parent variant — orchestrates children stagger automatically via
// Framer Motion's "when" + "staggerChildren" options.
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// staggerContainer with slower stagger (for large grids)
export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// ── Variant: staggerItem ──────────────────────────────────────────────────────
// Each direct child of a staggerContainer uses this.
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION_BASE,
  },
};

export const staggerItemZoom: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITION_BASE,
  },
};

// ── Named map (for prop-driven selection) ────────────────────────────────────
export const VARIANT_MAP = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  zoomIn,
  zoomInSpring,
  flipInX,
  fadeIn,
  slideInFromBottom,
  staggerContainer,
  staggerContainerSlow,
  staggerItem,
  staggerItemZoom,
} as const;

export type VariantKey = keyof typeof VARIANT_MAP;
