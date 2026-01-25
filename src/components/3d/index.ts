/**
 * 3D Components index for DIGITALIUM hierarchy system
 */

// Core objects
export { Chemise3D } from './objects/Chemise3D';
export { Trieur3D } from './objects/Trieur3D';
export { Armoire3D } from './objects/Armoire3D';

// Scenes
export { HierarchyScene3D } from './HierarchyScene3D';

// Re-export types
export type {
    Document3D,
    Compartiment,
    Trieur,
    Tiroir,
    Armoire,
    ViewMode,
} from '@/types/document3d';
