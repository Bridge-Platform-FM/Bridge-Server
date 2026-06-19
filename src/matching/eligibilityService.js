'use strict';

const { ELIGIBLE_ROLE_PAIRS } = require('./matchingConfig');

/**
 * Checks whether a source→target role pair is eligible for matching.
 */
const isEligible = (sourceRole, targetRole) => {
    if (!sourceRole || !targetRole) return false;
    const src = sourceRole.toUpperCase();
    const tgt = targetRole.toUpperCase();
    return ELIGIBLE_ROLE_PAIRS.some(
        pair => pair.source === src && pair.target === tgt
    );
};

/**
 * Filters a list of candidate profiles to only those with eligible roles
 * relative to the source role.
 */
const filterEligibleCandidates = (sourceRole, candidates) => {
    if (!sourceRole || !Array.isArray(candidates)) return [];
    return candidates.filter(candidate => isEligible(sourceRole, candidate.role_code));
};

module.exports = {
    isEligible,
    filterEligibleCandidates
};
