/**
 * Reveal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal scroll-triggered animation wrapper.
 *
 * Usage examples:
 *
 *   // Basic fade-up
 *   <Reveal>
 *     <p>Hello world</p>
 *   </Reveal>
 *
 *   // Custom variant + delay
 *   <Reveal variant="fadeInLeft" delay={0.2}>
 *     <Card />
 *   </Reveal>
 *
 *   // Index-based delay chaining (inside a map)
 *   {items.map((item, i) => (
 *     <Reveal key={i} index={i}>
 *       <ProductCard product={item} />
 *     </Reveal>
 *   ))}
 *
 *   // Stagger parent — children animate in sequence
 *   <Reveal variant="staggerContainer" asChild>
 *     <Reveal variant="staggerItem"><div>Item 1</div></Reveal>
 *     <Reveal variant="staggerItem"><div>Item 2</div></Reveal>
 *   </Reveal>
 *
 *   // Custom className on the motion.div wrapper
 *   <Reveal variant="zoomIn" className="w-full">
 *     <img src="..." />
 *   </Reveal>
 */

import React from 'react';
import { motion } from 'framer-motion';
import { VARIANT_MAP, type VariantKey } from './variants';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RevealProps {
  children: React.ReactNode;
  /** Preset animation variant key — defaults to 'fadeInUp' */
  variant?: VariantKey;
  /** Extra delay in seconds on top of index-based delay */
  delay?: number;
  /** Position in a list — auto-calculates stagger delay (0.1s * index) */
  index?: number;
  /** Base stagger multiplier in seconds — default 0.1 */
  staggerDelay?: number;
  /** className forwarded to the motion.div wrapper */
  className?: string;
  /** Viewport margin before triggering — default '-80px' */
  margin?: string;
  /** Trigger once (default true — no re-animation on scroll back) */
  once?: boolean;
  /** Threshold 0–1 — fraction of element visible before trigger */
  amount?: number | 'some' | 'all';
  /** Render as a specific HTML element — default 'div' */
  as?: keyof JSX.IntrinsicElements;
}

// ── Component ─────────────────────────────────────────────────────────────────
const Reveal: React.FC<RevealProps> = ({
  children,
  variant = 'fadeInUp',
  delay = 0,
  index = 0,
  staggerDelay = 0.1,
  className,
  margin = '-80px',
  once = true,
  amount = 0.15,
  as = 'div',
}) => {
  const selectedVariant = VARIANT_MAP[variant];

  // Total delay = explicit delay + (index × stagger step)
  const totalDelay = delay + index * staggerDelay;

  // Framer Motion's polymorphic factory
  const MotionElement = motion[as as 'div'] as typeof motion.div;

  return (
    <MotionElement
      className={className}
      variants={selectedVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin, amount }}
      // Override the variant's built-in delay with our computed one
      // (only for leaf variants — staggerContainer manages its own timing)
      transition={
        variant === 'staggerContainer' || variant === 'staggerContainerSlow'
          ? undefined
          : { delay: totalDelay }
      }
    >
      {children}
    </MotionElement>
  );
};

export default Reveal;
