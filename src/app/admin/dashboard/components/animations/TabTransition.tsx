'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TabTransitionProps {
  children: ReactNode;
  tabValue: string;
}

export function TabTransition({ children, tabValue }: TabTransitionProps) {
  return (
    <motion.div
      key={tabValue}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
