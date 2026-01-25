/**
 * IAstedButtonFull - Organic 3D Button
 * 
 * The signature "living matter" button for iAsted with:
 * - 3D perspective and depth layers
 * - Heartbeat animation (systolic/diastolic phases)
 * - Voice state animations (listening vs speaking)
 * - Membrane palpitation effects
 * - Drag-to-position functionality
 * 
 * Adapted for Digitalium document archiving context.
 */

import { useState, useRef, useEffect } from 'react';
import { Mic, MessageCircle, Brain, Archive } from 'lucide-react';

interface IAstedButtonProps {
    voiceListening?: boolean;
    voiceSpeaking?: boolean;
    voiceProcessing?: boolean;
    pulsing?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    className?: string;
    audioLevel?: number;
    size?: 'sm' | 'md' | 'lg';
    isInterfaceOpen?: boolean;
}

interface Shockwave {
    id: number;
}

interface Position {
    x: number;
    y: number;
}

const styles = `
/* Base styling with enhanced perspective */
.iasted-perspective-container {
  perspective: 1500px;
  position: fixed;
  z-index: 9999;
}

.iasted-perspective-container.grabbing {
  cursor: grabbing !important;
}

.iasted-thick-matter-button.grabbing {
  cursor: grabbing !important;
}

.iasted-perspective {
  perspective: 1200px;
  position: relative;
  transform-style: preserve-3d;
}

/* Base button with global heartbeat */
.iasted-thick-matter-button {
  transform-style: preserve-3d;
  border-radius: 50%;
  will-change: transform, box-shadow, border-radius, filter;
  transition: all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
  animation: 
    iasted-global-heartbeat 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-shadow-pulse 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-micro-breathing 4s ease-in-out infinite;
}

/* Micro breathing for organic effect */
@keyframes iasted-micro-breathing {
  0%, 100% { transform: scale(1) translateZ(0); }
  25% { transform: scale(1.02) translateZ(2px); }
  50% { transform: scale(0.98) translateZ(-2px); }
  75% { transform: scale(1.01) translateZ(1px); }
}

/* Hover - intensified heartbeat */
.iasted-thick-matter-button:hover {
  animation: 
    iasted-global-heartbeat-intense 1.4s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-shadow-pulse-intense 1.4s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-hover-glow 1.4s ease-in-out infinite;
}

/* Active - organic muscle contraction */
.iasted-thick-matter-button:active {
  animation: iasted-muscle-contraction-organic 1.2s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

@keyframes iasted-muscle-contraction-organic {
  0% { transform: scale3d(1, 1, 1); filter: brightness(1) saturate(1.7); border-radius: 50%; }
  15% { transform: scale3d(0.94, 0.92, 0.96) rotateX(2deg) rotateY(-1deg); filter: brightness(0.88) saturate(2); border-radius: 54% 46% 47% 53% / 46% 54% 45% 55%; }
  35% { transform: scale3d(0.82, 0.78, 0.86) rotateX(4deg) rotateY(-3deg); filter: brightness(0.78) saturate(2.5); border-radius: 62% 38% 41% 59% / 40% 60% 39% 61%; }
  65% { transform: scale3d(0.95, 0.94, 0.96) rotateX(1deg) rotateY(0deg); filter: brightness(0.98) saturate(2.3); border-radius: 54% 46% 47% 53% / 46% 54% 45% 55%; }
  100% { transform: scale3d(1, 1, 1); filter: brightness(1) saturate(1.7); border-radius: 50%; }
}

@keyframes iasted-hover-glow {
  0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.3), 0 8px 16px rgba(139, 92, 246, 0.2), inset 0 -5px 15px rgba(139, 92, 246, 0.2), inset 0 5px 15px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.7), 0 0 120px rgba(139, 92, 246, 0.5), 0 12px 24px rgba(139, 92, 246, 0.3), inset 0 -8px 20px rgba(139, 92, 246, 0.25), inset 0 8px 20px rgba(255, 255, 255, 0.4); }
}

@keyframes iasted-global-heartbeat-intense {
  0% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1) saturate(1.7); }
  3% { transform: scale3d(1.08, 1.1, 1.06) rotate(2deg); border-radius: 40% 60% 57% 43% / 44% 56% 44% 56%; filter: brightness(1.2) saturate(2.1); }
  6% { transform: scale3d(1.22, 1.18, 1.26) rotate(-3deg); border-radius: 35% 65% 62% 38% / 58% 42% 60% 40%; filter: brightness(1.4) saturate(2.5); }
  9% { transform: scale3d(1.3, 1.25, 1.35) rotate(1deg); border-radius: 32% 68% 65% 35% / 62% 38% 64% 36%; filter: brightness(1.5) saturate(2.8); }
  12% { transform: scale3d(1.15, 1.12, 1.18) rotate(-1deg); border-radius: 38% 62% 58% 42% / 54% 46% 56% 44%; filter: brightness(1.3) saturate(2.3); }
  15% { transform: scale3d(0.88, 0.91, 0.85) rotate(0deg); border-radius: 58% 42% 45% 55% / 42% 58% 44% 56%; filter: brightness(0.85) saturate(1.4); }
  18% { transform: scale3d(0.8, 0.84, 0.76) rotate(0.5deg); border-radius: 62% 38% 42% 58% / 38% 62% 40% 60%; filter: brightness(0.8) saturate(1.3); }
  25% { transform: scale3d(1.12, 1.08, 1.16) rotate(-0.5deg); border-radius: 41% 59% 56% 44% / 58% 42% 57% 43%; filter: brightness(1.2) saturate(2.2); }
  100% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1) saturate(1.7); }
}

@keyframes iasted-shadow-pulse-intense {
  0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.3), 0 8px 16px rgba(139, 92, 246, 0.2), inset 0 -5px 15px rgba(139, 92, 246, 0.2), inset 0 5px 15px rgba(255, 255, 255, 0.3); }
  6% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.6), 0 0 120px rgba(139, 92, 246, 0.4), 0 16px 32px rgba(139, 92, 246, 0.3), inset 0 -8px 20px rgba(139, 92, 246, 0.25), inset 0 8px 20px rgba(255, 255, 255, 0.4); }
  12% { box-shadow: 0 0 80px rgba(139, 92, 246, 0.8), 0 0 160px rgba(139, 92, 246, 0.6), 0 20px 40px rgba(139, 92, 246, 0.4), inset 0 -10px 25px rgba(139, 92, 246, 0.3), inset 0 10px 25px rgba(255, 255, 255, 0.5); }
}

@keyframes iasted-global-heartbeat {
  0% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1); }
  3% { transform: scale3d(1.05, 1.07, 1.03) rotate(1.5deg); border-radius: 42% 58% 55% 45% / 46% 54% 46% 54%; filter: brightness(1.08); }
  6% { transform: scale3d(1.14, 1.1, 1.18) rotate(-1.5deg); border-radius: 38% 62% 58% 42% / 55% 45% 58% 42%; filter: brightness(1.15); }
  9% { transform: scale3d(1.2, 1.16, 1.24) rotate(0.8deg); border-radius: 35% 65% 62% 38% / 58% 42% 60% 40%; filter: brightness(1.2); }
  12% { transform: scale3d(1.1, 1.07, 1.13) rotate(-0.8deg); border-radius: 40% 60% 55% 45% / 52% 48% 54% 46%; filter: brightness(1.1); }
  15% { transform: scale3d(0.93, 0.96, 0.9) rotate(0deg); border-radius: 55% 45% 48% 52% / 45% 55% 47% 53%; filter: brightness(0.92); }
  18% { transform: scale3d(0.86, 0.9, 0.82) rotate(0.4deg); border-radius: 58% 42% 45% 55% / 42% 58% 44% 56%; filter: brightness(0.86); }
  25% { transform: scale3d(1.07, 1.04, 1.1) rotate(-0.3deg); border-radius: 43% 57% 54% 46% / 56% 44% 55% 45%; filter: brightness(1.07); }
  100% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1); }
}

/* Depth layer */
.iasted-depth-layer {
  position: absolute;
  top: 5%; left: 5%;
  width: 90%; height: 90%;
  border-radius: 50%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 60%, rgba(139, 92, 246, 0.05) 80%);
  filter: blur(2px);
  opacity: 0.4;
  transform: translateZ(-10px);
}

/* Highlight layer */
.iasted-highlight-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 70%);
  transform: translateZ(15px) rotate(45deg);
  opacity: 0.4;
  pointer-events: none;
  animation: iasted-highlight-pulse 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite;
}

@keyframes iasted-highlight-pulse {
  0%, 100% { opacity: 0.4; transform: translateZ(15px) rotate(45deg) scale(1); }
  6% { opacity: 0.7; transform: translateZ(20px) rotate(45deg) scale(1.08); }
  12% { opacity: 0.85; transform: translateZ(25px) rotate(45deg) scale(1.12); }
  18% { opacity: 0.25; transform: translateZ(10px) rotate(45deg) scale(0.92); }
}

/* Organic membrane */
.iasted-organic-membrane {
  position: absolute; inset: -5%; border-radius: 50%;
  background: radial-gradient(circle at center, transparent 20%, rgba(139, 92, 246, 0.03) 40%, rgba(139, 92, 246, 0.08) 60%, rgba(139, 92, 246, 0.04) 80%, transparent 95%);
  opacity: 0;
  animation: iasted-membrane-palpitation 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite;
  pointer-events: none;
}

@keyframes iasted-membrane-palpitation {
  0%, 100% { opacity: 0; transform: scale(1) translateZ(0); filter: blur(0px); }
  3% { opacity: 0.3; transform: scale(0.95) translateZ(-5px); filter: blur(1px); }
  6% { opacity: 0.7; transform: scale(0.9) translateZ(-10px); filter: blur(0px); }
  9% { opacity: 0.9; transform: scale(1.15) translateZ(15px); filter: blur(2px); }
  12% { opacity: 0.95; transform: scale(1.25) translateZ(20px); filter: blur(3px); }
  18% { opacity: 0.4; transform: scale(1.12) translateZ(10px); filter: blur(1px); }
}

/* Listening state */
.iasted-thick-matter-button.voice-listening {
  animation: 
    iasted-global-heartbeat-listening 0.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-shadow-pulse-intense 0.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite;
}

@keyframes iasted-global-heartbeat-listening {
  0%, 100% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1.2) saturate(2); }
  25% { transform: scale3d(1.15, 1.18, 1.12) rotate(3deg); border-radius: 35% 65% 62% 38% / 58% 42% 60% 40%; filter: brightness(1.5) saturate(2.8); }
  50% { transform: scale3d(1.08, 1.05, 1.1) rotate(-2deg); border-radius: 45% 55% 52% 48% / 48% 52% 46% 54%; filter: brightness(1.3) saturate(2.3); }
  75% { transform: scale3d(1.12, 1.15, 1.1) rotate(2deg); border-radius: 40% 60% 58% 42% / 54% 46% 56% 44%; filter: brightness(1.4) saturate(2.5); }
}

/* Speaking state */
.iasted-thick-matter-button.voice-speaking {
  animation: 
    iasted-global-heartbeat-speaking 0.4s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-shadow-pulse-speaking 0.4s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite,
    iasted-speaking-glow 0.4s ease-in-out infinite;
}

@keyframes iasted-global-heartbeat-speaking {
  0% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1.2) saturate(2); }
  20% { transform: scale3d(1.25, 1.28, 1.22) rotate(5deg); border-radius: 28% 72% 70% 30% / 68% 32% 70% 30%; filter: brightness(1.8) saturate(3.5); }
  40% { transform: scale3d(1.15, 1.12, 1.18) rotate(-4deg); border-radius: 38% 62% 60% 40% / 58% 42% 60% 40%; filter: brightness(1.4) saturate(2.8); }
  60% { transform: scale3d(1.22, 1.25, 1.2) rotate(4deg); border-radius: 32% 68% 65% 35% / 62% 38% 64% 36%; filter: brightness(1.7) saturate(3.2); }
  80% { transform: scale3d(1.12, 1.1, 1.15) rotate(-3deg); border-radius: 42% 58% 55% 45% / 52% 48% 54% 46%; filter: brightness(1.35) saturate(2.6); }
  100% { transform: scale3d(1, 1, 1) rotate(0deg); border-radius: 50%; filter: brightness(1.2) saturate(2); }
}

@keyframes iasted-shadow-pulse-speaking {
  0%, 100% {
    box-shadow: 
      0 0 50px rgba(139, 92, 246, 0.8), 
      0 0 100px rgba(139, 92, 246, 0.6), 
      0 0 150px rgba(139, 92, 246, 0.4),
      0 12px 30px rgba(139, 92, 246, 0.4),
      inset 0 0 30px rgba(139, 92, 246, 0.3);
  }
  50% {
    box-shadow: 
      0 0 80px rgba(139, 92, 246, 1), 
      0 0 150px rgba(139, 92, 246, 0.8), 
      0 0 220px rgba(139, 92, 246, 0.6),
      0 16px 40px rgba(139, 92, 246, 0.6),
      inset 0 0 50px rgba(139, 92, 246, 0.5);
  }
}

@keyframes iasted-speaking-glow {
  0%, 100% { 
    filter: brightness(1.2) saturate(2) drop-shadow(0 0 20px rgba(139, 92, 246, 0.6));
  }
  50% { 
    filter: brightness(1.6) saturate(3) drop-shadow(0 0 40px rgba(139, 92, 246, 0.9));
  }
}

/* Morphing background - Digitalium purple theme */
.iasted-morphing-bg {
  background: 
    radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.9) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.9) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.9) 0%, transparent 50%),
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.9) 0%, transparent 50%),
    linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #6366F1 50%, #3B82F6 75%, #8B5CF6 100%);
  background-size: 200% 200%, 200% 200%, 200% 200%, 200% 200%, 400% 400%;
  animation: iasted-fluid-mix 25s ease-in-out infinite, iasted-bg-pulse 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite;
  filter: saturate(2) brightness(1.2);
  transform-style: preserve-3d;
}

@keyframes iasted-fluid-mix {
  0%, 100% { background-position: 0% 0%, 100% 100%, 100% 0%, 0% 100%, 0% 0%; }
  25% { background-position: 50% 50%, 50% 50%, 0% 100%, 100% 0%, 100% 30%; }
  50% { background-position: 100% 100%, 0% 0%, 0% 0%, 100% 100%, 60% 100%; }
  75% { background-position: 50% 0%, 50% 100%, 100% 50%, 0% 50%, 20% 50%; }
}

@keyframes iasted-bg-pulse {
  0%, 100% { filter: saturate(2) brightness(1.2); }
  6% { filter: saturate(2.5) brightness(1.35); }
  12% { filter: saturate(3) brightness(1.5); }
  18% { filter: saturate(1.8) brightness(1.1); }
}

@keyframes iasted-shadow-pulse {
  0%, 100% { box-shadow: 0 6px 12px rgba(139, 92, 246, 0.2), 0 0 50px rgba(139, 92, 246, 0.15), inset 0 -4px 12px rgba(139, 92, 246, 0.15), inset 0 4px 12px rgba(255, 255, 255, 0.25); }
  6% { box-shadow: 0 8px 16px rgba(139, 92, 246, 0.25), 0 0 80px rgba(139, 92, 246, 0.2), inset 0 -6px 16px rgba(139, 92, 246, 0.2), inset 0 6px 16px rgba(255, 255, 255, 0.3); }
  12% { box-shadow: 0 12px 28px rgba(139, 92, 246, 0.3), 0 0 120px rgba(139, 92, 246, 0.3), inset 0 -8px 20px rgba(139, 92, 246, 0.25), inset 0 8px 20px rgba(255, 255, 255, 0.4); }
}

/* Wave emissions */
.iasted-wave-emission {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  width: 100%; height: 100%; border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(139, 92, 246, 0.3) 30%, transparent 70%);
  transform: scale3d(0.9, 0.9, 1); opacity: 0;
  transform-style: preserve-3d;
}

.iasted-wave-1 { animation: iasted-wave-emission 2.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
.iasted-wave-2 { animation: iasted-wave-emission 2.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; animation-delay: 0.3s; }
.iasted-wave-3 { animation: iasted-wave-emission 2.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; animation-delay: 0.6s; }

@keyframes iasted-wave-emission {
  0%, 20%, 100% { transform: scale3d(0.9, 0.9, 1) translateZ(0px); opacity: 0; filter: blur(0px); }
  6% { transform: scale3d(1, 1, 1) translateZ(2px); opacity: 0.7; filter: blur(0px); }
  12% { transform: scale3d(1.8, 1.8, 1.2) translateZ(10px); opacity: 0; filter: blur(10px); }
}

/* Shine effect */
.iasted-shine-effect {
  position: absolute; inset: 0; border-radius: 50%;
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.4) 55%, transparent 65%);
  background-size: 200% 200%;
  animation: iasted-shine-movement 10s ease-in-out infinite;
  mix-blend-mode: overlay;
  pointer-events: none;
  opacity: 0.8;
}

@keyframes iasted-shine-movement {
  0%, 100% { background-position: -200% center; }
  50% { background-position: 200% center; }
}

/* Icons container */
.iasted-icons-container {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
  pointer-events: none; z-index: 40;
  animation: iasted-icon-pulse 2.8s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite;
}

@keyframes iasted-icon-pulse {
  0%, 100% { transform: scale(1); }
  6% { transform: scale(0.92); }
  12% { transform: scale(0.88); }
  18% { transform: scale(1.08); }
}

.iasted-icon-container {
  position: relative; width: 100%; height: 100%;
  display: flex; justify-content: center; align-items: center;
}

.iasted-alternating-element {
  position: absolute; opacity: 0;
  transform: translateY(10px) scale(0.9);
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
}

@keyframes iasted-fade-in-out {
  0%, 25%, 100% { opacity: 0; }
  5%, 20% { opacity: 1; }
}

.iasted-text-element { animation: iasted-fade-in-out 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite, iasted-text-float 3.5s ease-in-out infinite; }
.iasted-mic-element { animation: iasted-fade-in-out 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite, iasted-mic-float 3.5s ease-in-out infinite; animation-delay: 3s, 3s; }
.iasted-archive-element { animation: iasted-fade-in-out 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite, iasted-archive-float 3.5s ease-in-out infinite; animation-delay: 6s, 6s; }
.iasted-brain-element { animation: iasted-fade-in-out 12s cubic-bezier(0.25, 0.1, 0.25, 1) infinite, iasted-brain-float 3.5s ease-in-out infinite; animation-delay: 9s, 9s; }

@keyframes iasted-text-float { 0%, 100% { transform: translateY(20px) scale(0.7); } 50% { transform: translateY(-8px) scale(1.1); }}
@keyframes iasted-mic-float { 0%, 100% { transform: translateY(20px) scale(0.7) rotate(-5deg); } 50% { transform: translateY(-8px) scale(1.1) rotate(5deg); }}
@keyframes iasted-archive-float { 0%, 100% { transform: translateY(20px) scale(0.7) rotate(5deg); } 50% { transform: translateY(-8px) scale(1.1) rotate(-5deg); }}
@keyframes iasted-brain-float { 0%, 100% { transform: translateY(20px) scale(0.7) rotate(-3deg); } 50% { transform: translateY(-8px) scale(1.1) rotate(3deg); }}

.iasted-text {
  text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(139, 92, 246, 0.6);
  font-size: var(--iasted-text-size, 20px) !important;
  font-weight: bold; line-height: 1;
}

.iasted-icon-svg {
  width: var(--iasted-icon-size, 48px) !important;
  height: var(--iasted-icon-size, 48px) !important;
}

/* Shockwave effect */
.iasted-shockwave-effect {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  width: 100%; height: 100%; border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(139, 92, 246, 0.7) 30%, rgba(168, 85, 247, 0.5) 50%, rgba(99, 102, 241, 0.3) 70%, transparent 90%);
  animation: iasted-shockwave 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  mix-blend-mode: screen; pointer-events: none;
}

@keyframes iasted-shockwave {
  0% { transform: translate(-50%, -50%) scale(0.1); opacity: 1; filter: blur(0px); }
  25% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; filter: blur(1px); }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; filter: blur(2px); }
  75% { transform: translate(-50%, -50%) scale(2.2); opacity: 0.4; filter: blur(4px); }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; filter: blur(8px); }
}

/* Processing state */
.iasted-thick-matter-button.processing {
  animation: 
    iasted-processing-pulse 2s ease-in-out infinite,
    iasted-global-heartbeat-intense 1s cubic-bezier(0.68, -0.2, 0.265, 1.55) infinite !important;
}

@keyframes iasted-processing-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg) brightness(1); }
  25% { transform: scale(1.1) rotate(90deg); filter: hue-rotate(90deg) brightness(1.2); }
  50% { transform: scale(0.9) rotate(180deg); filter: hue-rotate(180deg) brightness(0.8); }
  75% { transform: scale(1.05) rotate(270deg); filter: hue-rotate(270deg) brightness(1.1); }
}

/* Size variants */
.iasted-thick-matter-button.sm { width: 80px; height: 80px; }
.iasted-thick-matter-button.md { width: 100px; height: 100px; }
.iasted-thick-matter-button.lg { width: 128px; height: 128px; }

/* Mobile responsive */
@media (max-width: 640px) {
  .iasted-thick-matter-button.sm { width: 64px; height: 64px; }
  .iasted-thick-matter-button.md { width: 80px; height: 80px; }
  .iasted-thick-matter-button.lg { width: 100px; height: 100px; }
}
`;

export const IAstedButtonFull: React.FC<IAstedButtonProps> = ({
    onClick,
    onDoubleClick,
    className = '',
    voiceListening = false,
    voiceSpeaking = false,
    voiceProcessing = false,
    pulsing = false,
    size = 'md',
    isInterfaceOpen = false
}) => {
    const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);
    const [isClicked, setIsClicked] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });
    const buttonPosition = useRef<Position>({ x: 0, y: 0 });
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const clickCount = useRef(0);

    useEffect(() => {
        // Restore saved position or use default
        const savedPosition = localStorage.getItem('iasted-button-position');
        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            setPosition(pos);
            buttonPosition.current = pos;
        } else {
            // Default position (bottom right)
            const getSize = () => {
                if (typeof window === 'undefined') return 100;
                if (window.innerWidth <= 640) {
                    return size === 'sm' ? 64 : size === 'lg' ? 100 : 80;
                }
                return size === 'sm' ? 80 : size === 'lg' ? 128 : 100;
            };

            const btnSize = getSize();
            const defaultPos = {
                x: typeof window !== 'undefined' ? window.innerWidth - btnSize - 24 : 0,
                y: typeof window !== 'undefined' ? window.innerHeight - btnSize - 24 : 0
            };
            setPosition(defaultPos);
            buttonPosition.current = defaultPos;
        }
    }, [size]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.left = `${position.x}px`;
            containerRef.current.style.top = `${position.y}px`;
        }
    }, [position]);

    const voiceStateClass = voiceListening ? 'voice-listening' : voiceSpeaking ? 'voice-speaking' : '';

    const handleClick = () => {
        if (isDragging) return;

        const shockwaveId = Date.now();
        setShockwaves([...shockwaves, { id: shockwaveId }]);
        setIsClicked(true);
        setIsProcessing(true);

        setTimeout(() => {
            setShockwaves(prev => prev.filter(r => r.id !== shockwaveId));
        }, 1000);

        setTimeout(() => setIsClicked(false), 1500);
        setTimeout(() => setIsProcessing(false), 3000);

        // Single vs double click handling
        clickCount.current += 1;

        if (clickCount.current === 1) {
            clickTimer.current = setTimeout(() => {
                onClick?.();
                clickCount.current = 0;
            }, 300);
        } else if (clickCount.current === 2) {
            if (clickTimer.current) {
                clearTimeout(clickTimer.current);
            }
            onDoubleClick?.();
            clickCount.current = 0;
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsActive(true);
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            dragStartPos.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const handleMouseUp = () => {
        setIsActive(false);
        setIsDragging(false);
        if (containerRef.current) {
            localStorage.setItem('iasted-button-position', JSON.stringify(buttonPosition.current));
        }
    };

    const handleMouseLeave = () => {
        setIsActive(false);
        setIsDragging(false);
        if (containerRef.current) {
            localStorage.setItem('iasted-button-position', JSON.stringify(buttonPosition.current));
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isActive) return;

        const deltaX = e.movementX;
        const deltaY = e.movementY;

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            setIsDragging(true);
        }

        if (isDragging && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const newX = e.clientX - dragStartPos.current.x;
            const newY = e.clientY - dragStartPos.current.y;

            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, Math.min(newY, maxY));

            setPosition({ x: constrainedX, y: constrainedY });
            buttonPosition.current = { x: constrainedX, y: constrainedY };
        }
    };

    return (
        <>
            <style>{styles}</style>

            <div
                ref={containerRef}
                className={`iasted-perspective-container ${isDragging ? 'grabbing' : ''}`}
                onMouseMove={handleMouseMove}
            >
                <div className="iasted-perspective">
                    <button
                        onClick={handleClick}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        className={`iasted-thick-matter-button ${size} ${isClicked ? 'color-shift' : ''} ${isActive ? 'active' : ''} ${isProcessing ? 'processing' : ''} ${isDragging ? 'grabbing' : ''} ${pulsing ? 'pulsing' : ''} ${voiceStateClass} relative cursor-grab focus:outline-none overflow-hidden border-0 ${className}`}
                        style={{
                            '--iasted-icon-size': size === 'sm' ? '24px' : size === 'lg' ? '48px' : '36px',
                            '--iasted-text-size': size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px',
                        } as React.CSSProperties}
                    >
                        {/* Depth layer */}
                        <div className="iasted-depth-layer"></div>

                        {/* Organic membrane */}
                        <div className="iasted-organic-membrane"></div>

                        {/* Background morphing */}
                        <div className="absolute inset-0 iasted-morphing-bg rounded-full"></div>

                        {/* Shine effect */}
                        <div className="iasted-shine-effect"></div>

                        {/* Wave emissions */}
                        <div className="iasted-wave-emission iasted-wave-1"></div>
                        <div className="iasted-wave-emission iasted-wave-2"></div>
                        <div className="iasted-wave-emission iasted-wave-3"></div>

                        {/* Highlight layer */}
                        <div className="iasted-highlight-layer"></div>

                        {/* Shockwaves */}
                        {shockwaves.map(shockwave => (
                            <div key={shockwave.id} className="iasted-shockwave-effect"></div>
                        ))}

                        {/* Icons container */}
                        <div className="iasted-icons-container">
                            <div className="iasted-icon-container">
                                {isInterfaceOpen && !voiceListening && !voiceSpeaking && !voiceProcessing ? (
                                    <MessageCircle className="text-white iasted-icon-svg" style={{ opacity: 1, transform: 'scale(1.2)' }} />
                                ) : voiceListening ? (
                                    <Mic className="text-white iasted-icon-svg" style={{ opacity: 1, transform: 'scale(1.3)' }} />
                                ) : voiceSpeaking ? (
                                    <span className="text-white iasted-text" style={{ opacity: 1, transform: 'scale(1.2)' }}>
                                        iAsted
                                    </span>
                                ) : voiceProcessing ? (
                                    <Brain className="text-white iasted-icon-svg" style={{ opacity: 1, transform: 'scale(1.2)' }} />
                                ) : (
                                    <>
                                        <span className="iasted-alternating-element iasted-text-element text-white iasted-text">
                                            iAsted
                                        </span>
                                        <Mic className="iasted-alternating-element iasted-mic-element text-white iasted-icon-svg" />
                                        <Archive className="iasted-alternating-element iasted-archive-element text-white iasted-icon-svg" />
                                        <Brain className="iasted-alternating-element iasted-brain-element text-white iasted-icon-svg" />
                                    </>
                                )}
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default IAstedButtonFull;
