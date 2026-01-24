/**
 * 3D Components - Barrel exports
 */

// Core components
export { Canvas3DWrapper } from './core/Canvas3DWrapper';
export { Scene3DBase } from './core/Scene3D';

// 3D Objects
export { Chemise3D } from './objects/Chemise3D';

// Transitions
export { TransitionTo3D, View3DTransition } from './transitions/TransitionTo3D';

// Re-export types
export type {
    Document3D,
    Chemise3DProps,
    Scene3DProps,
    TransitionTo3DProps,
    Canvas3DWrapperProps,
    Archive3DSceneProps,
} from '@/types/document3d';
