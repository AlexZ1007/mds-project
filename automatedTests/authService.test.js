const bcrypt = require('bcrypt');
const AuthService = require('../services/authService');
const connection = require('../server/database');

jest.mock('bcrypt');
jest.mock('../server/database', () => ({
    query: jest.fn(),
}));

describe('AuthService', () => {
    let authService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    describe('register', () => {
        const nickname = 'testuser';
        const password = 'testpassword';
        const email = 'test@example.com';
        const hashedPassword = 'hashed_password_123';

        beforeEach(() => {
            bcrypt.hashSync.mockReturnValue(hashedPassword);
        });

        connection.query.mockImplementation((query, params, callback) => {
            // Support both (query, params, callback) and (query, callback)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            callCount++;

            if (callCount === 1 && query.includes('SELECT * FROM User WHERE nickname')) {
                callback(null, []);
            } else if (callCount === 2 && query.includes('SELECT * FROM User WHERE email')) {
                callback(null, []);
            } else if (callCount === 3 && query.includes('INSERT INTO User')) {
                callback(null, { insertId: 1, affectedRows: 1 });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        it('throws error when username already exists', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                // Return existing user with same nickname
                callback(null, [{ nickname: nickname, email: 'other@example.com' }]);
            });

            await expect(authService.register(nickname, password, email))
                .rejects
                .toThrow('Username already exists');

            expect(connection.query).toHaveBeenCalledTimes(1);
            expect(bcrypt.hashSync).not.toHaveBeenCalled();
        });

        it('throws error when email already exists', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                // Return existing user with same email
                callback(null, [{ nickname: 'otheruser', email: email }]);
            });

            await expect(authService.register(nickname, password, email))
                .rejects
                .toThrow('Email already exists');

            expect(connection.query).toHaveBeenCalledTimes(1);
            expect(bcrypt.hashSync).not.toHaveBeenCalled();
        });

        it('handles database error during user existence check', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database connection failed'), null);
            });

            await expect(authService.register(nickname, password, email))
                .rejects
                .toThrow('Database connection failed');

            expect(connection.query).toHaveBeenCalledTimes(1);
        });

        it('handles database error during user insertion', async () => {
            let callCount = 0;

            connection.query.mockImplementation((query, params, callback) => {
                // Handle both callback signatures
                let actualCallback;
                if (typeof params === 'function') {
                    actualCallback = params;
                } else if (typeof callback === 'function') {
                    actualCallback = callback;
                } else {
                    throw new Error('No callback provided');
                }

                callCount++;

                if (callCount === 1 && query.includes('SELECT * FROM User WHERE nickname')) {
                    actualCallback(null, []);
                } else if (callCount === 2 && query.includes('SELECT * FROM User WHERE email')) {
                    actualCallback(null, []);
                } else if (callCount === 3 && query.includes('INSERT INTO User')) {
                    actualCallback(new Error('Insert failed'), null);
                } else {
                    actualCallback(new Error(`Unexpected query: ${query}`));
                }
            });
        });
    });

    describe('login', () => {
        const nickname = 'testuser';
        const email = 'test@example.com';
        const password = 'testpassword';
        const hashedPassword = 'hashed_password_123';

        const mockUser = {
            user_id: 1,
            nickname: nickname,
            email: email,
            password: hashedPassword,
            balance: 100,
            elo: 1000,
            matches_played: 5,
            matches_won: 3
        };

        const mockCards = [
            {
                card_id: 1,
                card_count: 2,
                level: 1,
                card_name: 'Fire Dragon',
                description: 'A powerful dragon',
                mana_points: 5,
                HP_points: 10,
                ability: 'Fire breath',
                card_image: 'dragon.jpg',
                damage: 8
            },
            {
                card_id: 2,
                card_count: 1,
                level: 2,
                card_name: 'Ice Wizard',
                description: 'A cold wizard',
                mana_points: 3,
                HP_points: 6,
                ability: 'Freeze',
                card_image: 'wizard.jpg',
                damage: 4
            }
        ];

        it('successfully logs in user with nickname and returns user with cards', async () => {
            bcrypt.compareSync.mockReturnValue(true);

            connection.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT * FROM User WHERE nickname')) {
                    // 1. Find user by nickname/email
                    callback(null, [mockUser]);
                } else if (query.includes('SELECT u.card_id')) {
                    // 2. Get user's cards
                    callback(null, mockCards);
                } else {
                    callback(new Error(`Unexpected query: ${query}`));
                }
            });

            const result = await authService.login(nickname, password);

            expect(result.user_id).toBe(1);
            expect(result.nickname).toBe(nickname);
            expect(result.cards).toHaveLength(2);
            expect(result.cards[0]).toEqual({
                card: {
                    card_id: 1,
                    name: 'Fire Dragon',
                    description: 'A powerful dragon',
                    ability: 'Fire breath',
                    mana_points: 5,
                    HP_points: 10,
                    damage: 8,
                    card_image: 'dragon.jpg',
                    level: 1
                },
                card_count: 2
            });

            expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
            expect(connection.query).toHaveBeenCalledTimes(2);
        });

        it('successfully logs in user with email', async () => {
            bcrypt.compareSync.mockReturnValue(true);

            connection.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT * FROM User WHERE nickname')) {
                    // Verify email is used in both nickname and email parameters
                    expect(params).toEqual([email, email]);
                    callback(null, [mockUser]);
                } else if (query.includes('SELECT u.card_id')) {
                    callback(null, []);
                } else {
                    callback(new Error(`Unexpected query: ${query}`));
                }
            });

            const result = await authService.login(email, password);

            expect(result.user_id).toBe(1);
            expect(connection.query).toHaveBeenCalledTimes(2);
        });

        it('throws error when user is not found', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(null, []); // Empty results
            });

            await expect(authService.login(nickname, password))
                .rejects
                .toThrow('User not found');

            expect(connection.query).toHaveBeenCalledTimes(1);
            expect(bcrypt.compareSync).not.toHaveBeenCalled();
        });

        it('throws error when password is incorrect', async () => {
            bcrypt.compareSync.mockReturnValue(false);

            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(null, [mockUser]);
            });

            await expect(authService.login(nickname, password))
                .rejects
                .toThrow('Password is incorrect');

            expect(connection.query).toHaveBeenCalledTimes(1);
            expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
        });

        it('handles user with no cards', async () => {
            bcrypt.compareSync.mockReturnValue(true);

            connection.query.mockImplementation((query, params, callback) => {
                if (query.includes('SELECT * FROM User WHERE nickname')) {
                    callback(null, [mockUser]);
                } else if (query.includes('SELECT u.card_id')) {
                    callback(null, []); // No cards
                } else {
                    callback(new Error(`Unexpected query: ${query}`));
                }
            });

            const result = await authService.login(nickname, password);

            expect(result.user_id).toBe(1);
            expect(result.cards).toEqual([]);
            expect(connection.query).toHaveBeenCalledTimes(2);
        });

        it('handles database error during user lookup', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            await expect(authService.login(nickname, password))
                .rejects
                .toThrow('Database error');

            expect(connection.query).toHaveBeenCalledTimes(1);
        });

        it('handles database error during cards lookup', async () => {
            bcrypt.compareSync.mockReturnValue(true);

            let callCount = 0;
            connection.query.mockImplementation((query, params, callback) => {
                callCount++;

                if (callCount === 1) {
                    callback(null, [mockUser]);
                } else if (callCount === 2) {
                    callback(new Error('Cards query failed'), null);
                }
            });

            await expect(authService.login(nickname, password))
                .rejects
                .toThrow('Cards query failed');

            expect(connection.query).toHaveBeenCalledTimes(2);
        });
    });

    describe('getUserData', () => {
        const userId = 1;
        const mockUserData = {
            nickname: 'testuser',
            email: 'test@example.com',
            balance: 150,
            elo: 1200,
            matches_played: 10,
            matches_won: 7,
            division_name: 'Bronze'
        };

        it('successfully retrieves user data with division', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                expect(params).toEqual([userId]);
                callback(null, [mockUserData]);
            });

            const result = await authService.getUserData(userId);

            expect(result).toEqual(mockUserData);
            expect(connection.query).toHaveBeenCalledTimes(1);

            // Verify the query includes the expected tables and fields
            const queryCall = connection.query.mock.calls[0];
            expect(queryCall[0]).toContain('SELECT u.nickname, u.email, u.balance, u.elo');
            expect(queryCall[0]).toContain('FROM User u');
            expect(queryCall[0]).toContain('left JOIN Division d');
        });

        it('successfully retrieves user data without division', async () => {
            const userDataWithoutDivision = {
                ...mockUserData,
                division_name: null
            };

            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(null, [userDataWithoutDivision]);
            });

            const result = await authService.getUserData(userId);

            expect(result).toEqual(userDataWithoutDivision);
            expect(result.division_name).toBeNull();
        });

        it('handles case when user is not found', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(null, []); // No results
            });

            const result = await authService.getUserData(userId);

            expect(result).toBeUndefined();
            expect(connection.query).toHaveBeenCalledTimes(1);
        });

        it('handles database error', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(new Error('Database connection failed'), null);
            });

            await expect(authService.getUserData(userId))
                .rejects
                .toThrow('Database connection failed');

            expect(connection.query).toHaveBeenCalledTimes(1);
        });

        it('verifies correct query parameters', async () => {
            connection.query.mockImplementationOnce((query, params, callback) => {
                callback(null, [mockUserData]);
            });

            const testUserId = 42;
            await authService.getUserData(testUserId);

            const queryCall = connection.query.mock.calls[0];
            expect(queryCall[1]).toEqual([testUserId]);
        });
    });
});