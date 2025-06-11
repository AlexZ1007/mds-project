const ShopService = require('../services/shopService');
const connection = require('../server/database');

jest.mock('../server/database', () => ({
    query: jest.fn(),
}));

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

    it('throws error if user has insufficient balance', async () => {
        // Mock the balance check to return insufficient balance
        connection.query.mockImplementationOnce((query, params, callback) => {
            callback(null, [{ balance: 5 }]); // User has only 5 coins
        });

        await expect(shopService.openPack({ type: 1, cost: 10 }, userId))
            .rejects
            .toThrow('Not enough coins!');
        
        // Verify that only the balance check query was called
        expect(connection.query).toHaveBeenCalledTimes(1);
    });

    it('deducts balance and returns 1 card for type 1 pack', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            // Handle case where params is actually the callback (no params provided)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            
            callCount++;
            
            if (query.includes('Select balance from User')) {
                // 1. Get user balance
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance')) {
                // 2. Update user balance (deduct cost)
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                // 3. Get all cards for random selection
                callback(null, cards);
            } else if (query.includes('Select * from User_Cards where')) {
                // 4. Check if user already has this card
                callback(null, []); // User doesn't have the card yet
            } else if (query.includes('INSERT INTO User_Cards')) {
                // 5. Insert new card into user's collection
                callback(null, { insertId: 1 });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 1, cost: 10 }, userId);
        
        // Verify the result
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('card_name');
        expect(['CardA', 'CardB', 'CardC']).toContain(result[0].card_name);
        
        // Verify expected number of database calls:
        // 1 balance check + 1 balance update + 1 get cards + 1 check existing + 1 insert = 5 calls
        expect(connection.query).toHaveBeenCalledTimes(5);
    });

    it('deducts balance and returns 3 cards for type 2 pack', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            // Handle case where params is actually the callback (no params provided)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            
            callCount++;
            
            if (query.includes('Select balance from User')) {
                // 1. Get user balance
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance')) {
                // 2. Update user balance (deduct cost)
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                // 3. Get all cards for random selection
                callback(null, cards);
            } else if (query.includes('Select * from User_Cards where')) {
                // 4, 6, 8. Check if user already has each card (3 times)
                callback(null, []); // User doesn't have any of the cards yet
            } else if (query.includes('INSERT INTO User_Cards')) {
                // 5, 7, 9. Insert each new card into user's collection (3 times)
                callback(null, { insertId: callCount });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 2, cost: 20 }, userId);
        
        // Verify the result
        expect(result).toHaveLength(3);
        result.forEach(card => {
            expect(card).toHaveProperty('card_name');
            expect(['CardA', 'CardB', 'CardC']).toContain(card.card_name);
        });
        
        // Verify expected number of database calls:
        // 1 balance check + 1 balance update + 1 get cards + 3 check existing + 3 insert = 9 calls
        expect(connection.query).toHaveBeenCalledTimes(9);
    });

    it('handles existing cards by incrementing card_count', async () => {
        let callCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            // Handle case where params is actually the callback (no params provided)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            
            callCount++;
            
            if (query.includes('Select balance from User')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance')) {
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('Select * from User_Cards where')) {
                // User already has this card
                callback(null, [{ user_id: userId, card_id: 10, card_count: 2 }]);
            } else if (query.includes('UPDATE User_Cards SET card_count')) {
                // Increment existing card count
                callback(null, { affectedRows: 1 });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 1, cost: 10 }, userId);
        
        // Verify the result
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('card_name');
        
        // Verify expected number of database calls:
        // 1 balance check + 1 balance update + 1 get cards + 1 check existing + 1 update count = 5 calls
        expect(connection.query).toHaveBeenCalledTimes(5);
    });

    it('handles mixed scenario with both new and existing cards for type 2 pack', async () => {
        let callCount = 0;
        let existingCheckCount = 0;
        
        connection.query.mockImplementation((query, params, callback) => {
            // Handle case where params is actually the callback (no params provided)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            
            callCount++;
            
            if (query.includes('Select balance from User')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance')) {
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('Select * from User_Cards where')) {
                existingCheckCount++;
                if (existingCheckCount === 1) {
                    // First card - user already has it
                    callback(null, [{ user_id: userId, card_id: 10, card_count: 1 }]);
                } else {
                    // Second and third cards - user doesn't have them
                    callback(null, []);
                }
            } else if (query.includes('UPDATE User_Cards SET card_count')) {
                // Increment existing card count
                callback(null, { affectedRows: 1 });
            } else if (query.includes('INSERT INTO User_Cards')) {
                // Insert new cards
                callback(null, { insertId: callCount });
            } else {
                callback(new Error(`Unexpected query: ${query}`));
            }
        });

        const result = await shopService.openPack({ type: 2, cost: 20 }, userId);
        
        // Verify the result
        expect(result).toHaveLength(3);
        result.forEach(card => {
            expect(card).toHaveProperty('card_name');
            expect(['CardA', 'CardB', 'CardC']).toContain(card.card_name);
        });
        
        // Verify expected number of database calls:
        // 1 balance check + 1 balance update + 1 get cards + 3 check existing + 1 update + 2 insert = 9 calls
        expect(connection.query).toHaveBeenCalledTimes(9);
    });

    it('verifies correct balance deduction', async () => {
        let balanceUpdateParams = [];
        
        connection.query.mockImplementation((query, params, callback) => {
            // Handle case where params is actually the callback (no params provided)
            if (typeof params === 'function') {
                callback = params;
                params = undefined;
            }
            
            if (query.includes('Select balance from User')) {
                callback(null, [{ balance: 100 }]);
            } else if (query.includes('UPDATE User SET balance')) {
                balanceUpdateParams = params;
                callback(null, { affectedRows: 1 });
            } else if (query.includes('SELECT * FROM Card')) {
                callback(null, cards);
            } else if (query.includes('Select * from User_Cards where')) {
                callback(null, []);
            } else if (query.includes('INSERT INTO User_Cards')) {
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