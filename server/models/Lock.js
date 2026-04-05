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
    type: DataTypes.STRING,
    allowNull: false,
  },
  iv: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  authTag: {
    type: DataTypes.STRING,
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
    // ENUM string mapped to 'active', 'unlocking', 'completed'
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
  }
}, {
  timestamps: true,
});

module.exports = Lock;
