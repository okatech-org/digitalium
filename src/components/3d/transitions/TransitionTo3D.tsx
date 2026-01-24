/**
 * TransitionTo3D - Animated transition from 2D to 3D view
 * Uses Framer Motion for smooth morphing effect
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { TransitionTo3DProps } from '@/types/document3d';

export function TransitionTo3D({
    isActive,
    onComplete,
    children,
    duration = 1.5,
}: TransitionTo3DProps) {
    return (
        <AnimatePresence mode="wait">
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Background overlay */}
                    <motion.div
                        className="absolute inset-0 bg-background"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />

                    {/* Morphing container */}
                    <motion.div
                        className="relative z-10"
                        initial={{
                            scale: 0.8,
                            rotateX: 0,
                            rotateY: 0,
                            perspective: 1000,
                        }}
                        animate={{
                            scale: [0.8, 1.1, 1],
                            rotateX: [0, 15, 0],
                            rotateY: [0, -10, 0],
                        }}
                        transition={{
                            duration: duration,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        onAnimationComplete={onComplete}
                    >
                        {/* Loading indicator */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
                            <motion.div
                                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
                                animate={{
                                    rotateY: [0, 360],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <span className="text-3xl">📁</span>
                            </motion.div>
                            <p className="text-lg font-medium text-foreground">
                                Passage en mode 3D...
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Préparation de l'environnement
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Particle effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-emerald-500/30 rounded-full"
                                initial={{
                                    x: '50%',
                                    y: '50%',
                                    scale: 0,
                                }}
                                animate={{
                                    x: `${Math.random() * 100}%`,
                                    y: `${Math.random() * 100}%`,
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2 + Math.random(),
                                    delay: i * 0.1,
                                    repeat: Infinity,
                                    ease: "easeOut",
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Simpler inline transition wrapper
export function View3DTransition({
    children,
    show
}: {
    children: React.ReactNode;
    show: boolean;
}) {
    return (
        <AnimatePresence mode="wait">
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default TransitionTo3D;
