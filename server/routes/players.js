const express = require('express');
const router = express.Router();

// بيانات اللاعبين المؤقتة
let players = [
  { id: 1, name: 'Player1', level: 50, playtime: 120 },
  { id: 2, name: 'Player2', level: 45, playtime: 95 },
  { id: 3, name: 'Player3', level: 60, playtime: 200 }
];

// الحصول على قائمة اللاعبين
router.get('/', (req, res) => {
  res.json({
    total: players.length,
    players: players
  });
});

// الحصول على معلومات لاعب محدد
router.get('/:id', (req, res) => {
  const player = players.find(p => p.id === parseInt(req.params.id));
  
  if (!player) {
    return res.status(404).json({ error: 'اللاعب غير موجود' });
  }

  res.json(player);
});

// كيك لاعب
router.post('/:id/kick', (req, res) => {
  const { reason } = req.body;
  const player = players.find(p => p.id === parseInt(req.params.id));
  
  if (!player) {
    return res.status(404).json({ error: 'اللاعب غير موجود' });
  }

  players = players.filter(p => p.id !== parseInt(req.params.id));
  
  res.json({
    success: true,
    message: `تم طرد ${player.name}: ${reason}`
  });
});

// بان لاعب
router.post('/:id/ban', (req, res) => {
  const { reason, duration } = req.body;
  const player = players.find(p => p.id === parseInt(req.params.id));
  
  if (!player) {
    return res.status(404).json({ error: 'اللاعب غير موجود' });
  }

  res.json({
    success: true,
    message: `تم بان ${player.name} لمدة ${duration} ساعة: ${reason}`
  });
});

module.exports = router;