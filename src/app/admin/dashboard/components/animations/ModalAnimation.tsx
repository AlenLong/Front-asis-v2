'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface ModalAnimationProps {
  children: ReactNode;
  isOpen: boolean;
}

export function ModalAnimation({ children, isOpen }: ModalAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          className="contents"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Overlay animation for modal backdrop
export function ModalOverlay({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80"
        />
      )}
    </AnimatePresence>
  );
}
