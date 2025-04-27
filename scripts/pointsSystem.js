export const getTier = (points) => {
    if (points >= 1500) return 'Platinum';
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Basic';
};

export const earnPoints = (currentPoints, earnedPoints) => {
    const newCurrentPoints = currentPoints + earnedPoints;
    return { newCurrentPoints };
};

export const redeemPoints = (currentPoints, redeemAmount) => {
    const newCurrentPoints = Math.max(currentPoints - redeemAmount, 0);
    return { newCurrentPoints };
};

export const checkTierUpdate = (currentPoints, currentTier, tierAchievedDate) => {
    const now = new Date();
    const achievedDate = new Date(tierAchievedDate);
    achievedDate.setFullYear(achievedDate.getFullYear() + 1);

    const requiredPoints = {
        'Platinum': 1500,
        'Gold': 1000,
        'Silver': 500,
        'Basic': 0
    };

    if (now >= achievedDate) {
        const targetPoints = requiredPoints[currentTier];
        if (currentPoints >= targetPoints) {
            // Renew tier for another year
            return { tier: currentTier, tierAchievedDate: now.toISOString() };
        } else {
            // Downgrade to Basic
            return { tier: 'Basic', tierAchievedDate: null };
        }
    }
    return null; // No change
};

export const getTierDisplayDetails = (tier, currentPoints, tierAchievedDate) => {
    const nextTierThreshold =
        tier === 'Platinum' ? null :
            tier === 'Gold' ? 1500 :
                tier === 'Silver' ? 1000 : 500;

    const nextTier =
        tier === 'Platinum' ? 'Max Tier' :
            tier === 'Gold' ? 'Platinum' :
                tier === 'Silver' ? 'Gold' : 'Silver';

    const pointsToNext = nextTierThreshold ? Math.max(nextTierThreshold - currentPoints, 0) : 0;

    let formattedExpiryDate = 'N/A';

    if (tierAchievedDate && typeof tierAchievedDate.toDate === 'function') {
        const achievedDate = tierAchievedDate.toDate();
        achievedDate.setFullYear(achievedDate.getFullYear() + 1);
        formattedExpiryDate = achievedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    return { nextTier, pointsToNext, formattedExpiryDate };
};