import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RipplePoint {
  id: number;
  x: number;
  y: number;
  isButton: boolean;
}

/**
 * TactileRipple provides instant visual tactile feedback for mobile and desktop touches.
 * When the user taps or clicks any button, link, card, or element on the page,
 * a fluid glowing ring blooms from their exact touch coordinate, confirming the touch.
 */
export const TactileRipple: React.FC = () => {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Ignore right clicks or auxiliary clicks
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('button, a, input, textarea, select, [role="button"], .clickable-card, [tabindex]')
      );

      const newRipple: RipplePoint = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        isButton: isInteractive,
      };

      setRipples((prev) => [...prev.slice(-8), newRipple]);

      // Automatically clean up after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{
              scale: 0.1,
              opacity: ripple.isButton ? 0.85 : 0.45,
            }}
            animate={{
              scale: ripple.isButton ? 2.8 : 1.8,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ripple.isButton ? 0.55 : 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
            }}
            className="flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            {/* Inner radiant glow */}
            <div
              className={`rounded-full ${
                ripple.isButton
                  ? 'w-12 h-12 bg-gradient-to-r from-emerald-400/40 to-cyan-400/50 shadow-[0_0_24px_rgba(16,185,129,0.7)] border border-emerald-300/80'
                  : 'w-8 h-8 bg-cyan-400/25 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
