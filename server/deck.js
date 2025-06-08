const db = require('./database');

const getDeck = async (req, res) => {
  const userId = req.user.id;
  const [rows] = await db.query(
    'SELECT dc.position, c.* FROM deck_card dc JOIN cards c ON dc.card_id = c.id WHERE dc.user_id = ? ORDER BY dc.position',
    [userId]
  );
  res.json(rows);
};

const addCard = async (req, res) => {
  const userId = req.user.id;
  const { card_id } = req.body;

  const [count] = await db.query('SELECT COUNT(*) as total FROM deck_card WHERE user_id = ?', [userId]);
  if (count[0].total >= 12) return res.status(400).json({ error: 'Deck full' });

  const [maxPos] = await db.query('SELECT MAX(position) as max FROM deck_card WHERE user_id = ?', [userId]);
  const nextPos = (maxPos[0].max || 0) + 1;

  await db.query('INSERT INTO deck_card (user_id, card_id, position) VALUES (?, ?, ?)', [userId, card_id, nextPos]);
  res.json({ success: true });
};

const removeCard = async (req, res) => {
  const userId = req.user.id;
  const { card_id } = req.body;

  await db.query('DELETE FROM deck_card WHERE user_id = ? AND card_id = ? LIMIT 1', [userId, card_id]);
  res.json({ success: true });
};

module.exports = { getDeck, addCard, removeCard };
