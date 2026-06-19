'use strict';

// Mock the DB models/sequelize before requiring anything that touches them
jest.mock('../../models', () => ({
    sequelize: {
        query: jest.fn(),
        transaction: jest.fn(),
        authenticate: jest.fn().mockResolvedValue(true)
    },
    Sequelize: {}
}));

// Mock the matching repository so tests are DB-free
jest.mock('../../matching/matchingRepository', () => ({
    getProfileWithRole: jest.fn(),
    getCandidateProfiles: jest.fn()
}));

// Mock the logger to suppress output during tests
jest.mock('../../configs/logger', () => ({
    errorLogger: { error: jest.fn(), info: jest.fn() },
    accessLogger: { info: jest.fn() }
}));

const matchingRepository = require('../../matching/matchingRepository');
const matchingService    = require('../../matching/matchingService');

// ─── Shared mock data ─────────────────────────────────────────────────────────

const mockStartupProfile = {
    id: 1,
    role_code: 'STARTUP',
    company_name: 'FinCo',
    organization_name: 'FinCo',
    startup_industry_sector: ['fintech', 'saas'],
    primary_sector: ['ai_ml'],
    startup_intent: 'seed_investment',
    funding_ask_amt_min: 500000,
    funding_ask_amt_max: 2000000,
    funding_stage: 'seed',
    country: 'India', continent: 'Asia',
    profile_photo: 'photo.jpg', short_bio: 'A startup',
    first_name: 'Alice', last_name: 'Smith',
    linkedin_profile_url: 'https://linkedin.com/in/alice',
    business_description: 'Fintech tools',
    is_active: true, is_deleted: false
};

const mockInvestorProfile = {
    id: 2,
    role_code: 'INVESTOR',
    company_name: 'VC Fund',
    organization_name: 'VC Fund',
    investor_sector_preference: ['fintech', 'saas'],
    investor_intent: 'actively_deploying',
    ticket_size_amt_min: 1000000,
    ticket_size_amt_max: 5000000,
    prefrerred_investment_stage: ['seed'],
    investor_type: 'vc',
    country: 'India', continent: 'Asia',
    profile_photo: 'photo.jpg', short_bio: 'VC firm',
    first_name: 'Bob', last_name: 'Jones',
    linkedin_profile_url: 'https://linkedin.com/in/bob',
    is_active: true, is_deleted: false
};

// ─── getMatches() Service Tests ───────────────────────────────────────────────

describe('MatchingService — getMatches()', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- Successful response ---
    test('returns success with matches array for valid profileId', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result = await matchingService.getMatches(1);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('profileId', 1);
        expect(result.data).toHaveProperty('matches');
        expect(Array.isArray(result.data.matches)).toBe(true);
    });

    test('returned matches contain required fields', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result = await matchingService.getMatches(1);
        const match  = result.data.matches[0];

        expect(match).toHaveProperty('profileId');
        expect(match).toHaveProperty('companyName');
        expect(match).toHaveProperty('role');
        expect(match).toHaveProperty('compatibility');
        expect(match).toHaveProperty('breakdown');
        expect(match).toHaveProperty('topFactors');
        expect(match).toHaveProperty('rationale');
        expect(match).toHaveProperty('short_bio');
        expect(match).toHaveProperty('linkedin_profile_url');
        expect(match).toHaveProperty('linkedin_url');
    });

    test('compatibility score is a number between 0 and 100', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result = await matchingService.getMatches(1);
        const { compatibility } = result.data.matches[0];

        expect(typeof compatibility).toBe('number');
        expect(compatibility).toBeGreaterThanOrEqual(0);
        expect(compatibility).toBeLessThanOrEqual(100);
    });

    test('breakdown contains all 7 factor keys', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result  = await matchingService.getMatches(1);
        const { breakdown } = result.data.matches[0];

        ['sector', 'intent', 'geo', 'revenue', 'moq', 'completeness', 'exportReady'].forEach(key => {
            expect(breakdown).toHaveProperty(key);
        });
    });

    test('topFactors is an array of strings', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result      = await matchingService.getMatches(1);
        const { topFactors } = result.data.matches[0];

        expect(Array.isArray(topFactors)).toBe(true);
        topFactors.forEach(f => expect(typeof f).toBe('string'));
    });

    test('rationale is a non-empty string', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result    = await matchingService.getMatches(1);
        const { rationale } = result.data.matches[0];

        expect(typeof rationale).toBe('string');
        expect(rationale.length).toBeGreaterThan(0);
    });

    test('matches are sorted by compatibility descending', async () => {
        const secondInvestor = {
            ...mockInvestorProfile,
            id: 3,
            investor_sector_preference: ['gaming'],
            investor_intent: 'open_to_co_investment',
            country: 'USA', continent: 'North America',
            ticket_size_amt_min: 20000000,
            ticket_size_amt_max: 50000000
        };
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([secondInvestor, mockInvestorProfile]);

        const result  = await matchingService.getMatches(1);
        const matches = result.data.matches;

        expect(matches.length).toBe(2);
        expect(matches[0].compatibility).toBeGreaterThanOrEqual(matches[1].compatibility);
    });

    // --- Empty matches ---
    test('returns success with empty matches when no candidates exist', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([]);

        const result = await matchingService.getMatches(1);

        expect(result.success).toBe(true);
        expect(result.data.matches).toHaveLength(0);
    });

    test('returns success with empty matches when no eligible candidates exist', async () => {
        // INVESTOR source — only STARTUP is eligible. If all candidates are INVESTOR, result is empty.
        const investorSource = { ...mockInvestorProfile, id: 10 };
        const anotherInvestor = { ...mockInvestorProfile, id: 11 };

        matchingRepository.getProfileWithRole.mockResolvedValue(investorSource);
        matchingRepository.getCandidateProfiles.mockResolvedValue([anotherInvestor]);

        const result = await matchingService.getMatches(10);

        expect(result.success).toBe(true);
        expect(result.data.matches).toHaveLength(0);
    });

    // --- Invalid profile ID ---
    test('returns 404 error for non-existent profileId', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(null);
        matchingRepository.getCandidateProfiles.mockResolvedValue([]);

        const result = await matchingService.getMatches(9999);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(404);
    });

    test('returns 404 error for non-numeric profileId', async () => {
        const result = await matchingService.getMatches('not-a-number');
        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(404);
    });

    test('returns 404 error for null profileId', async () => {
        const result = await matchingService.getMatches(null);
        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(404);
    });

    test('returns 500 error when repository throws', async () => {
        matchingRepository.getProfileWithRole.mockRejectedValue(new Error('DB connection failed'));

        const result = await matchingService.getMatches(1);

        expect(result.success).toBe(false);
        expect(result.statusCode).toBe(500);
    });

    // --- Response shape ---
    test('success response has correct statusCode 200', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result = await matchingService.getMatches(1);
        expect(result.statusCode).toBe(200);
    });

    test('profileId in response matches the requested profileId', async () => {
        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile]);

        const result = await matchingService.getMatches(1);
        expect(result.data.profileId).toBe(1);
    });

    test('ineligible candidates are excluded from matches', async () => {
        // STARTUP source — INVESTOR (id:2) is eligible, but another STARTUP (id:5) is not
        const anotherStartup = { ...mockStartupProfile, id: 5, role_code: 'STARTUP' };

        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue([mockInvestorProfile, anotherStartup]);

        const result  = await matchingService.getMatches(1);
        const ids     = result.data.matches.map(m => m.profileId);

        expect(ids).toContain(mockInvestorProfile.id);
        expect(ids).not.toContain(anotherStartup.id);
    });

    test('limits returned matches to MATCHES_LIMIT configuration value', async () => {
        const candidates = Array.from({ length: 8 }, (_, i) => ({
            ...mockInvestorProfile,
            id: i + 2,
            company_name: `Investor ${i + 2}`
        }));

        matchingRepository.getProfileWithRole.mockResolvedValue(mockStartupProfile);
        matchingRepository.getCandidateProfiles.mockResolvedValue(candidates);

        const result = await matchingService.getMatches(1);
        expect(result.success).toBe(true);
        expect(result.data.matches).toHaveLength(5);
    });
});
