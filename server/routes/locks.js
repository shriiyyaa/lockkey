const express = require('express');
const { body, validationResult } = require('express-validator');
const Lock = require('../models/Lock');
const auth = require('../middleware/auth');
const { encrypt, decrypt } = require('../services/encryption');

const router = express.Router();

// All routes require authentication (device token)
router.use(auth);

// POST /api/locks — Create a new lock
router.post('/', [
  body('platform').trim().notEmpty().withMessage('Platform name is required'),
  body('password').notEmpty().withMessage('Password to lock is required'),
  body('durationMinutes').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { platform, password, durationMinutes, futureMessage } = req.body;

    // Encrypt the platform password
    const { encrypted, iv, authTag } = encrypt(password);

    const lockStart = new Date();
    const lockEnd = new Date(lockStart.getTime() + durationMinutes * 60 * 1000);

    const lock = await Lock.create({
      userId: req.user.id,
      platform,
      encryptedPassword: encrypted,
      iv,
      authTag,
      lockStart,
      lockEnd,
      futureMessage: futureMessage || '',
      status: 'active'
    });

    res.status(201).json({
      id: lock.id,
      platform: lock.platform,
      lockStart: lock.lockStart,
      lockEnd: lock.lockEnd,
      futureMessage: lock.futureMessage,
      status: lock.status
    });
  } catch (err) {
    console.error('Create lock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/locks — Get all device locks
router.get('/', async (req, res) => {
  try {
    const locks = await Lock.findAll({ 
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['encryptedPassword', 'iv', 'authTag'] }
    });

    // Auto-complete locks whose timer has expired
    const now = new Date();
    const updatedLocks = [];

    for (const lock of locks) {
      if (lock.status === 'active' && new Date(lock.lockEnd) <= now) {
        lock.status = 'completed';
        await Lock.update({ status: 'completed' }, { where: { id: lock.id } });
      }
      updatedLocks.push({
        id: lock.id,
        platform: lock.platform,
        lockStart: lock.lockStart,
        lockEnd: lock.lockEnd,
        futureMessage: lock.futureMessage,
        status: lock.status,
        earlyUnlockRequestedAt: lock.earlyUnlockRequestedAt,
        earlyUnlockDelay: lock.earlyUnlockDelay,
        challengeCompleted: lock.challengeCompleted,
        createdAt: lock.createdAt
      });
    }

    res.json(updatedLocks);
  } catch (err) {
    console.error('Get locks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/locks/stats — Get stats
router.get('/stats', async (req, res) => {
  try {
    const locks = await Lock.findAll({ where: { userId: req.user.id } });
    const now = new Date();

    let totalFocusMinutes = 0;
    let completedLocks = 0;
    let activeLocks = 0;

    for (const lock of locks) {
      const end = new Date(lock.lockEnd);
      const start = new Date(lock.lockStart);

      if (lock.status === 'completed' || end <= now) {
        completedLocks++;
        totalFocusMinutes += (end - start) / (1000 * 60);
      } else if (lock.status === 'active' || lock.status === 'unlocking') {
        activeLocks++;
        // Count focus time so far
        totalFocusMinutes += (now - start) / (1000 * 60);
      }
    }

    res.json({
      totalFocusMinutes: Math.round(totalFocusMinutes),
      completedLocks,
      activeLocks,
      totalLocks: locks.length
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/locks/:id — Get single lock
router.get('/:id', async (req, res) => {
  try {
    const lock = await Lock.findOne({ 
      where: { id: req.params.id, userId: req.user.id },
      attributes: { exclude: ['encryptedPassword', 'iv', 'authTag'] }
    });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    // Auto-complete if timer expired
    const now = new Date();
    if (lock.status === 'active' && new Date(lock.lockEnd) <= now) {
      lock.status = 'completed';
      await Lock.update({ status: 'completed' }, { where: { id: lock.id } });
    }

    res.json({
      id: lock.id,
      platform: lock.platform,
      lockStart: lock.lockStart,
      lockEnd: lock.lockEnd,
      futureMessage: lock.futureMessage,
      status: lock.status,
      earlyUnlockRequestedAt: lock.earlyUnlockRequestedAt,
      earlyUnlockDelay: lock.earlyUnlockDelay,
      challengeCompleted: lock.challengeCompleted,
      createdAt: lock.createdAt
    });
  } catch (err) {
    console.error('Get lock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/locks/:id/request-unlock — Request early unlock
router.post('/:id/request-unlock', async (req, res) => {
  try {
    const lock = await Lock.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    if (lock.status !== 'active') {
      return res.status(400).json({ message: 'Lock is not active' });
    }

    // Set unlock delay (15 minutes default)
    const delay = req.body.delayMinutes || 15;
    lock.status = 'unlocking';
    lock.earlyUnlockRequestedAt = new Date();
    lock.earlyUnlockDelay = Math.min(Math.max(delay, 5), 30);
    await lock.save();

    res.json({
      message: 'Unlock request started. Please wait for the delay period.',
      futureMessage: lock.futureMessage,
      earlyUnlockRequestedAt: lock.earlyUnlockRequestedAt,
      earlyUnlockDelay: lock.earlyUnlockDelay,
      unlockAvailableAt: new Date(lock.earlyUnlockRequestedAt.getTime() + lock.earlyUnlockDelay * 60 * 1000)
    });
  } catch (err) {
    console.error('Request unlock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/locks/:id/complete-challenge
router.post('/:id/complete-challenge', async (req, res) => {
  try {
    const lock = await Lock.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    // For early unlock: check if delay has passed
    if (lock.status === 'unlocking') {
      const unlockTime = new Date(lock.earlyUnlockRequestedAt.getTime() + lock.earlyUnlockDelay * 60 * 1000);
      if (new Date() < unlockTime) {
        return res.status(400).json({
          message: 'Delay period has not ended yet',
          unlockAvailableAt: unlockTime
        });
      }
    }

    // For natural completion: timer must have expired
    if (lock.status === 'active') {
      if (new Date() < new Date(lock.lockEnd)) {
        return res.status(400).json({ message: 'Lock timer has not expired yet' });
      }
    }

    // Validate challenge answer
    const { challengeType, answer } = req.body;

    if (challengeType === 'typing') {
      const { targetSentence } = req.body;
      if (!answer || answer !== targetSentence) {
        return res.status(400).json({ message: 'Typing does not match. Try again carefully.' });
      }
    } else if (challengeType === 'math') {
      const { correctAnswer } = req.body;
      if (parseInt(answer) !== parseInt(correctAnswer)) {
        return res.status(400).json({ message: 'Incorrect answer. Try again.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid challenge type' });
    }

    // Mark challenge as completed
    lock.challengeCompleted = true;
    lock.status = 'completed';
    await lock.save();

    res.json({ message: 'Challenge completed! You can now reveal your password.' });
  } catch (err) {
    console.error('Complete challenge error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/locks/:id/reveal
router.post('/:id/reveal', async (req, res) => {
  try {
    const lock = await Lock.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    if (lock.status !== 'completed') {
      return res.status(400).json({ message: 'Lock must be completed before revealing password' });
    }

    if (!lock.challengeCompleted) {
      return res.status(400).json({ message: 'Please complete the challenge first' });
    }

    // Decrypt and return
    const password = decrypt(lock.encryptedPassword, lock.iv, lock.authTag);

    res.json({ password });
  } catch (err) {
    console.error('Reveal password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/locks/:id/fuck-it — Emergency bypass
router.post('/:id/fuck-it', async (req, res) => {
  try {
    const lock = await Lock.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    // Immediate completion
    lock.status = 'completed';
    lock.challengeCompleted = true;
    await lock.save();

    res.json({ message: 'Emergency bypass activated. Lock cleared.' });
  } catch (err) {
    console.error('Fuck-it bypass error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/locks/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Lock.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Lock not found' });
    }
    res.json({ message: 'Lock deleted' });
  } catch (err) {
    console.error('Delete lock error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
