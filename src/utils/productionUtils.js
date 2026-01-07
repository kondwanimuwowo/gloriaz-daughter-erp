// Production utility functions for consistent stage management and progress calculation

export const PRODUCTION_STAGES = [
    {
        id: "cutting",
        label: "Cutting",
        progress: 20,
        description: "Fabric cutting stage"
    },
    {
        id: "stitching",
        label: "Stitching",
        progress: 40,
        description: "Garment stitching stage"
    },
    {
        id: "finishing",
        label: "Finishing",
        progress: 60,
        description: "Finishing touches stage"
    },
    {
        id: "quality_check",
        label: "Quality Check",
        progress: 80,
        description: "Quality inspection stage"
    },
    {
        id: "completed",
        label: "Completed",
        progress: 100,
        description: "Production completed"
    }
];

/**
 * Calculate production progress percentage based on current status
 * @param {string} status - Current production status
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (status) => {
    const stage = PRODUCTION_STAGES.find(s => s.id === status);
    return stage ? stage.progress : 0;
};

/**
 * Get the next production stage
 * @param {string} currentStatus - Current production status
 * @returns {object|null} Next stage object or null if already completed
 */
export const getNextStage = (currentStatus) => {
    const currentIndex = PRODUCTION_STAGES.findIndex(s => s.id === currentStatus);
    if (currentIndex >= 0 && currentIndex < PRODUCTION_STAGES.length - 1) {
        return PRODUCTION_STAGES[currentIndex + 1];
    }
    return null;
};

/**
 * Get the previous production stage
 * @param {string} currentStatus - Current production status
 * @returns {object|null} Previous stage object or null if at first stage
 */
export const getPreviousStage = (currentStatus) => {
    const currentIndex = PRODUCTION_STAGES.findIndex(s => s.id === currentStatus);
    if (currentIndex > 0) {
        return PRODUCTION_STAGES[currentIndex - 1];
    }
    return null;
};

/**
 * Get stage information by status ID
 * @param {string} status - Production status
 * @returns {object|null} Stage object or null if not found
 */
export const getStageInfo = (status) => {
    return PRODUCTION_STAGES.find(s => s.id === status) || null;
};

/**
 * Check if a status is valid
 * @param {string} status - Production status to validate
 * @returns {boolean} True if status is valid
 */
export const isValidStatus = (status) => {
    return PRODUCTION_STAGES.some(s => s.id === status);
};

/**
 * Get current stage index
 * @param {string} status - Production status
 * @returns {number} Stage index (-1 if not found)
 */
export const getStageIndex = (status) => {
    return PRODUCTION_STAGES.findIndex(s => s.id === status);
};
