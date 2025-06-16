// pointsSystem.js — BACKEND VERSION

/**
 * Get tier details for a user based on current points and achieved date.
 * @param {string} currentTier - The user's current tier.
 * @param {number} currentPoints - The user's current points.
 * @param {Date | string} tierAchievedDate - When they reached the current tier.
 * @returns {{ nextTier: string, pointsToNext: number, newTier: string, formattedExpiryDate: string }}
 */
function getTierDisplayDetails(currentTier, currentPoints, tierAchievedDate) {
    const tiers = [
        { name: 'Basic', min: 0, max: 499 },
        { name: 'Silver', min: 500, max: 999 },
        { name: 'Gold', min: 1000, max: Infinity },
    ];

    let nextTier = '';
    let pointsToNext = 0;
    let newTier = currentTier;

    let currentIndex = tiers.findIndex(t => t.name === currentTier);
    if (currentIndex === -1) currentIndex = 0;
    const current = tiers[currentIndex];
    const next = tiers[currentIndex + 1];

    if (next) {
        nextTier = next.name;
        if (currentPoints >= next.min) {
            newTier = next.name;
        }
        pointsToNext = Math.max(0, next.min - currentPoints);
    } else {
        nextTier = currentTier;
        pointsToNext = 0;
    }

    let formattedExpiryDate = '';
    if (tierAchievedDate) {
        const achievedDate = new Date(tierAchievedDate);
        const expiry = new Date(achievedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        formattedExpiryDate = expiry.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    return {
        nextTier,
        pointsToNext,
        newTier,
        formattedExpiryDate,
    };
}

module.exports = { getTierDisplayDetails };