import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';

interface SwipeableContentProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

export default function SwipeableContent({
  children,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft,
  canSwipeRight,
}: SwipeableContentProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (Math.abs(eventData.deltaX) > 10) {
        setSwipeDirection(eventData.deltaX > 0 ? 'right' : 'left');
      }
    },
    onSwipedLeft: () => {
      if (canSwipeLeft && onSwipeLeft) {
        onSwipeLeft();
      }
      setSwipeDirection(null);
    },
    onSwipedRight: () => {
      if (canSwipeRight && onSwipeRight) {
        onSwipeRight();
      }
      setSwipeDirection(null);
    },
    trackMouse: true,
    preventScrollOnSwipe: false,
    delta: 10,
  });

  return (
    <motion.div
      {...handlers}
      animate={{
        x: swipeDirection === 'left' && canSwipeLeft ? -5 :
           swipeDirection === 'right' && canSwipeRight ? 5 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}
