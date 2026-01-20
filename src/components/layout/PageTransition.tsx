import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    rotateY: -15,
    transformOrigin: 'left center',
    x: '5%',
    scale: 0.95,
    boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
  },
  enter: {
    opacity: 1,
    rotateY: 0,
    x: '0%',
    scale: 1,
    boxShadow: '0 0 0 rgba(0,0,0,0)',
    transition: {
      duration: 0.6,
      ease: [0.645, 0.045, 0.355, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    rotateY: 15,
    transformOrigin: 'right center',
    x: '-5%',
    scale: 0.95,
    boxShadow: '20px 0 60px rgba(0,0,0,0.3)',
    transition: {
      duration: 0.5,
      ease: [0.645, 0.045, 0.355, 1] as const,
    },
  },
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <div className="perspective-[1500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="w-full min-h-screen bg-background"
          style={{ 
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
