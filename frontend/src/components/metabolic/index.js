// Metabolic Module - Barrel File
// This file provides a clean import interface for the metabolic components
// Future: Individual components can be split into separate files and lazy-loaded

// Re-export everything from the main components file
export {
    PREDEFINED_LISTS,
    NavigationHeader,
    StatusCircle,
    ActionGrid,
    InfoModal,
    CameraModal,
    NoteModal,
    ConfirmationModal,
    EditEventModal,
    FastingInfoModal,
    ElectrolyteAlert,
    RecoveryStatusCard,
    RefeedProtocolModal,
    ElectrolyteRecipeModal
} from '../MetabolicComponents';

// Re-export constants from dedicated file (for direct access)
export { PREDEFINED_LISTS as PredefinedLists } from './constants';
