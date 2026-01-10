// solvyCalculations.js
// Pure calculation functions for SOLVY's 70/20/10 model.

function calculateProfitShare(memberVolume, totalVolume, totalInterchange) {
    if (totalVolume <= 0 || totalInterchange <= 0) {
        return { patronagePercentage: 0, memberShare: 0 };
    }

    const patronagePercentage = (memberVolume / totalVolume) * 100;
    const totalProfitPool = totalInterchange * 0.20;
    const memberShare = totalProfitPool * (patronagePercentage / 100);

    return {
        patronagePercentage: parseFloat(patronagePercentage.toFixed(4)),
        memberShare: parseFloat(memberShare.toFixed(2))
    };
}

function calculateSovereigntyAcceleration(memberContribution, totalMembers) {
    const memberAnnual = memberContribution * 12;
    const collectiveAnnual = memberAnnual * totalMembers;

    return {
        memberAnnual: parseFloat(memberAnnual.toFixed(2)),
        collectiveAnnual: parseFloat(collectiveAnnual.toFixed(2))
    };
}

export { calculateProfitShare, calculateSovereigntyAcceleration };
