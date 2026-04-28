const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Lock = sequelize.define('Lock', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  encryptedPassword: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  iv: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authTag: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lockStart: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  lockEnd: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  futureMessage: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  status: {
    // 'active' | 'unlocking' | 'completed'
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  earlyUnlockRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  earlyUnlockDelay: {
    type: DataTypes.INTEGER,
    defaultValue: 15, // minutes
  },
  challengeCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isBypassFailed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // ── Purgatory Protocol tracking ─────────────────────────────────────────
  // Timestamps stored server-side to prevent client-side spoofing
  purgatoryPhase1At: {
    type: DataTypes.DATE,
    allowNull: true, // set when user completes The Void
  },
  purgatoryPhase2At: {
    type: DataTypes.DATE,
    allowNull: true, // set when user completes The Gauntlet
  },
  purgatoryPhase3At: {
    type: DataTypes.DATE,
    allowNull: true, // set when user completes The Mirror
  },
}, {
  timestamps: true,
});

module.exports = Lock;
