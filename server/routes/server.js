const express = require('express');
const router = express.Router();

// معلومات السيرفر
const serverInfo = {
  name: 'FiveM Server',
  players: 3,
  maxPlayers: 128,
  uptime: 24,
  fps: 60,
  status: 'online',
  version: '1.0.0',
  resources: [
    { name: 'spawnmanager', status: 'started' },
    { name: 'mapmanager', status: 'started' },
    { name: 'baseevents', status: 'started' }
  ]
};

// معلومات السيرفر
router.get('/info', (req, res) => {
  res.json(serverInfo);
});

// الإحصائيات
router.get('/stats', (req, res) => {
  res.json({
    players: serverInfo.players,
    maxPlayers: serverInfo.maxPlayers,
    uptime: serverInfo.uptime,
    fps: serverInfo.fps,
    memory: Math.random() * 100,
    cpu: Math.random() * 100,
    network: {
      incoming: Math.random() * 1000,
      outgoing: Math.random() * 1000
    }
  });
});

// إعادة تشغيل السيرفر
router.post('/restart', (req, res) => {
  res.json({
    success: true,
    message: 'جاري إعادة تشغيل السيرفر...'
  });
});

// إيقاف السيرفر
router.post('/stop', (req, res) => {
  res.json({
    success: true,
    message: 'جاري إيقاف السيرفر...'
  });
});

// الموارد
router.get('/resources', (req, res) => {
  res.json({
    total: serverInfo.resources.length,
    resources: serverInfo.resources
  });
});

// تشغيل مورد
router.post('/resources/:name/start', (req, res) => {
  const resource = serverInfo.resources.find(r => r.name === req.params.name);
  
  if (!resource) {
    return res.status(404).json({ error: 'المورد غير موجود' });
  }

  resource.status = 'started';
  res.json({ success: true, message: `تم تشغيل ${req.params.name}` });
});

// إيقاف مورد
router.post('/resources/:name/stop', (req, res) => {
  const resource = serverInfo.resources.find(r => r.name === req.params.name);
  
  if (!resource) {
    return res.status(404).json({ error: 'المورد غير موجود' });
  }

  resource.status = 'stopped';
  res.json({ success: true, message: `تم إيقاف ${req.params.name}` });
});

module.exports = router;