const ShopService = require('../services/shopService');

// Mock the database connection
jest.mock('../server/database', () => ({
    query: jest.fn(),
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn()
}));

// Mock shopObserver
jest.mock('../services/shopObserver', () => ({
    notifyNewListing: jest.fn()
}));

// Mock axios
jest.mock('axios', () => ({
    post: jest.fn()
}));

const connection = require('../server/database');

describe('ShopService.openPack', () => {
    let shopService;
    const userId = 1;
    const cards = [
        { card_id: 10, card_name: 'CardA' },
        { card_id: 11, card_name: 'CardB' },
        { card_id: 12, card_name: 'CardC' },
    ];

    beforeEach(() => {
        shopService = new ShopService();
        jest.clearAllMocks();
    });

    it('throws error if user does not exist', async () => {
        connection.query.mockImplementationOnce((query, params, callback) => {
            callback(null, []); // No user found
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('User not found!');
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    it('throws error if card query fails', async () => {
        let call = 0;
        connection.query.mockImplementation((query, params, callback) => {
            call++;
            if (call === 1) {
                callback(null, [{ balance: 100 }]);
            } else if (call === 2) {
                callback(null, { affectedRows: 1 });
            } else if (call === 3) {
                callback(new Error('Card query failed'), null);
            }
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Card query failed');
    });

    it('throws error if updating user balance fails', async () => {
        let call = 0;
        connection.query.mockImplementation((query, params, callback) => {
            call++;
            if (call === 1) {
                callback(null, [{ balance: 100 }]);
            } else if (call === 2) {
                callback(new Error('Balance update failed'), null);
            }
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Balance update failed');
    });

    it('throws error if inserting user card fails', async () => {
        let call = 0;
        connection.query.mockImplementation((query, params, callback) => {
            call++;
            if (call === 1) {
                callback(null, [{ balance: 100 }]);
            } else if (call === 2) {
                callback(null, { affectedRows: 1 });
            } else if (call === 3) {
                callback(null, cards);
            } else if (call === 4) {
                callback(null, []);
            } else if (call === 5) {
                callback(new Error('Insert card failed'), null);
            }
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Insert card failed');
    });

    it('throws error if updating card count fails', async () => {
        let call = 0;
        connection.query.mockImplementation((query, params, callback) => {
            call++;
            if (call === 1) {
                callback(null, [{ balance: 100 }]);
            } else if (call === 2) {
                callback(null, { affectedRows: 1 });
            } else if (call === 3) {
                callback(null, cards);
            } else if (call === 4) {
                callback(null, [{ user_id: userId, card_id: 10, card_count: 2 }]);
            } else if (call === 5) {
                callback(new Error('Update card count failed'), null);
            }
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Update card count failed');
    });

    it('returns different cards for type 2 pack if random selection allows', async () => {
        let call = 0;
        connection.query.mockImplementation((query, params, callback) => {
            call++;
            if (call === 1) {
                // User balance check
                callback(null, [{ balance: 100 }]);
            } else if (call === 2) {
                // Balance update
                callback(null, { affectedRows: 1 });
            } else if (call === 3) {
                // Get all cards
                callback(null, cards);
            } else if (call >= 4 && call <= 6) {
                // Check existing cards (3 times) - none exist
                callback(null, []);
            } else if (call >= 7 && call <= 9) {
                // Insert new cards (3 times)
                callback(null, { insertId: call });
            } else {
                callback(new Error(`Unexpected call ${call}: ${query}`));
            }
        });

        // Mock Math.random to return different values for each card
        const mathRandom = jest.spyOn(Math, 'random');
        let randomCallCount = 0;
        mathRandom.mockImplementation(() => {
            const values = [0, 0.33, 0.66]; // Different indexes for each card
            return values[randomCallCount++ % 3];
        });

        const result = await shopService.openPack({ type: 2, cost: 20 }, userId);
        
        expect(result).toHaveLength(3);
        expect(connection.query).toHaveBeenCalledTimes(9);

        mathRandom.mockRestore();
    });

    it('throws error if user has insufficient balance', async () => {
        connection.query.mockImplementationOnce((query, params, callback) => {
            callback(null, [{ balance: 5 }]); // User has only 5 coins
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Not enough coins!');
        
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    it('deducts balance and returns 1 card for type 1 pack', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            callCount++;
            
            if (query.includes('SELECT balance FROM User WHERE user_id = ?')) {
                // 1. Get user balance
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance = balance - ? WHERE user_id = ?')) {
                // 2. Update user balance (deduct cost)
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                // 3. Get all cards for random selection
                callback(null, cards);
            } else if (query.includes('SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?')) {
                // 4. Check if user already has this card
                callback(null, []); // User doesn't have the card yet
            } else if (query.includes('INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)')) {
                // 5. Insert new card into user's collection
                callback(null, { insertId: 1 });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 1, cost: 10 }, userId);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('card_name');
        expect(['CardA', 'CardB', 'CardC']).toContain(result[0].card_name);
        expect(connection.query).toHaveBeenCalledTimes(5);
    });

    it('deducts balance and returns 3 cards for type 2 pack', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            callCount++;
            
            if (query.includes('SELECT balance FROM User WHERE user_id = ?')) {
                // 1. Get user balance
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance = balance - ? WHERE user_id = ?')) {
                // 2. Update user balance (deduct cost)
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                // 3. Get all cards for random selection
                callback(null, cards);
            } else if (query.includes('SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?')) {
                // 4, 6, 8. Check if user already has each card (3 times)
                callback(null, []); // User doesn't have any of the cards yet
            } else if (query.includes('INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)')) {
                // 5, 7, 9. Insert each new card into user's collection (3 times)
                callback(null, { insertId: callCount });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 2, cost: 20 }, userId);
        
        expect(result).toHaveLength(3);
        result.forEach(card => {
            expect(card).toHaveProperty('card_name');
            expect(['CardA', 'CardB', 'CardC']).toContain(card.card_name);
        });
        
        expect(connection.query).toHaveBeenCalledTimes(9);
    });

    it('handles existing cards by incrementing card_count', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            callCount++;
            
            if (query.includes('SELECT balance FROM User WHERE user_id = ?')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance = balance - ? WHERE user_id = ?')) {
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?')) {
                // User already has this card
                callback(null, [{ user_id: userId, card_id: 10, card_count: 2 }]);
            } else if (query.includes('UPDATE User_Cards SET card_count = card_count + 1 WHERE user_id = ? AND card_id = ?')) {
                // Increment existing card count
                callback(null, { affectedRows: 1 });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 1, cost: 10 }, userId);
        
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('card_name');
        expect(connection.query).toHaveBeenCalledTimes(5);
    });

    it('handles mixed scenario with both new and existing cards for type 2 pack', async () => {
        let callCount = 0;
        let existingCheckCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            callCount++;
            
            if (query.includes('SELECT balance FROM User WHERE user_id = ?')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance = balance - ? WHERE user_id = ?')) {
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?')) {
                existingCheckCount++;
                if (existingCheckCount === 1) {
                    // First card - user already has it
                    callback(null, [{ user_id: userId, card_id: 10, card_count: 1 }]);
                } else {
                    // Second and third cards - user doesn't have them
                    callback(null, []);
                }
            } else if (query.includes('UPDATE User_Cards SET card_count = card_count + 1 WHERE user_id = ? AND card_id = ?')) {
                // Increment existing card count
                callback(null, { affectedRows: 1 });
            } else if (query.includes('INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)')) {
                // Insert new cards
                callback(null, { insertId: callCount });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 2, cost: 20 }, userId);
        
        expect(result).toHaveLength(3);
        result.forEach(card => {
            expect(card).toHaveProperty('card_name');
            expect(['CardA', 'CardB', 'CardC']).toContain(card.card_name);
        });
        
        expect(connection.query).toHaveBeenCalledTimes(9);
    });

    it('verifies correct balance deduction', async () => {
        let balanceUpdateParams = [];
        
        connection.query.mockImplementation((query, params, callback) => {
            if (query.includes('SELECT balance FROM User WHERE user_id = ?')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance = balance - ? WHERE user_id = ?')) {
                balanceUpdateParams = params;
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('SELECT * FROM User_Cards WHERE user_id = ? AND card_id = ?')) {
                callback(null, []);
            } else if (query.includes('INSERT INTO User_Cards (user_id, card_id, card_count) VALUES (?, ?, 1)')) {
                callback(null, { insertId: 1 });
            } else {
                callback(null, []);
            }
        });

        await shopService.openPack({ type: 1, cost: 15 }, userId);
        
        // Verify that the balance update was called with correct parameters
        expect(balanceUpdateParams).toEqual([15, userId]);
    });

    it('handles database errors', async () => {
        connection.query.mockImplementationOnce((query, params, callback) => {
            callback(new Error('Database connection failed'), null);
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Database connection failed');
    });
});