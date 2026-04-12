'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AnimatedButton({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  disabled = false,
  className = '',
  size = 'default',
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Button
        type={type}
        variant={variant}
        disabled={disabled}
        className={className}
        size={size}
        onClick={onClick}
      >
        {children}
      </Button>
    </motion.div>
  );
}
