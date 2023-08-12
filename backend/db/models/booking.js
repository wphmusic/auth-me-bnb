'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      this.belongsTo(models.Spot, { foreignKey: 'spotId', as: 'Spot' });
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    }
  }
  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    spotId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    startDate: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    endDate: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return this.getDataValue('createdAt').toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return this.getDataValue('updatedAt').toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
      },
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });

  return Booking;
};
