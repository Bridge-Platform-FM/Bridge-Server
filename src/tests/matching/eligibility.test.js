'use strict';

const { isEligible, filterEligibleCandidates } = require('../../matching/eligibilityService');

describe('EligibilityService', () => {

    describe('isEligible()', () => {

        // --- Valid combinations ---
        test('STARTUP → INVESTOR is eligible', () => {
            expect(isEligible('STARTUP', 'INVESTOR')).toBe(true);
        });

        test('STARTUP → B2B is eligible', () => {
            expect(isEligible('STARTUP', 'B2B')).toBe(true);
        });

        test('INVESTOR → STARTUP is eligible', () => {
            expect(isEligible('INVESTOR', 'STARTUP')).toBe(true);
        });

        test('B2B → STARTUP is eligible', () => {
            expect(isEligible('B2B', 'STARTUP')).toBe(true);
        });

        test('B2B → B2B is eligible', () => {
            expect(isEligible('B2B', 'B2B')).toBe(true);
        });

        // --- Invalid combinations ---
        test('INVESTOR → INVESTOR is NOT eligible', () => {
            expect(isEligible('INVESTOR', 'INVESTOR')).toBe(false);
        });

        test('INVESTOR → B2B is NOT eligible', () => {
            expect(isEligible('INVESTOR', 'B2B')).toBe(false);
        });

        test('STARTUP → STARTUP is NOT eligible', () => {
            expect(isEligible('STARTUP', 'STARTUP')).toBe(false);
        });

        // --- Edge cases ---
        test('returns false when sourceRole is null', () => {
            expect(isEligible(null, 'INVESTOR')).toBe(false);
        });

        test('returns false when targetRole is null', () => {
            expect(isEligible('STARTUP', null)).toBe(false);
        });

        test('returns false when both roles are null', () => {
            expect(isEligible(null, null)).toBe(false);
        });

        test('returns false for unknown role', () => {
            expect(isEligible('ADMIN', 'STARTUP')).toBe(false);
        });

        test('is case-insensitive — lowercase roles are handled', () => {
            expect(isEligible('startup', 'investor')).toBe(true);
        });

        test('is case-insensitive — mixed case roles are handled', () => {
            expect(isEligible('Startup', 'Investor')).toBe(true);
        });
    });

    describe('filterEligibleCandidates()', () => {
        const candidates = [
            { id: 1, role_code: 'INVESTOR' },
            { id: 2, role_code: 'B2B' },
            { id: 3, role_code: 'STARTUP' },
            { id: 4, role_code: 'INVESTOR' },
        ];

        test('STARTUP source returns INVESTOR and B2B candidates only', () => {
            const result = filterEligibleCandidates('STARTUP', candidates);
            expect(result).toHaveLength(3);
            expect(result.map(c => c.id)).toEqual(expect.arrayContaining([1, 2, 4]));
            expect(result.find(c => c.id === 3)).toBeUndefined();
        });

        test('INVESTOR source returns only STARTUP candidates', () => {
            const result = filterEligibleCandidates('INVESTOR', candidates);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(3);
        });

        test('B2B source returns STARTUP and B2B candidates', () => {
            const mixedCandidates = [
                { id: 1, role_code: 'B2B' },
                { id: 2, role_code: 'STARTUP' },
                { id: 3, role_code: 'INVESTOR' },
            ];
            const result = filterEligibleCandidates('B2B', mixedCandidates);
            expect(result).toHaveLength(2);
            expect(result.map(c => c.id)).toEqual(expect.arrayContaining([1, 2]));
        });

        test('returns empty array when no candidates are eligible', () => {
            const investorCandidates = [
                { id: 1, role_code: 'INVESTOR' },
                { id: 2, role_code: 'B2B' },
            ];
            const result = filterEligibleCandidates('INVESTOR', investorCandidates);
            expect(result).toHaveLength(0);
        });

        test('returns empty array when candidates list is empty', () => {
            const result = filterEligibleCandidates('STARTUP', []);
            expect(result).toHaveLength(0);
        });

        test('returns empty array when candidates is not an array', () => {
            const result = filterEligibleCandidates('STARTUP', null);
            expect(result).toHaveLength(0);
        });

        test('returns empty array when sourceRole is null', () => {
            const result = filterEligibleCandidates(null, candidates);
            expect(result).toHaveLength(0);
        });
    });
});
