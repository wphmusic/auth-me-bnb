'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    static associate(models) {
      this.belongsTo(models.Spot, { foreignKey: 'spotId', as: 'spot', onDelete: 'CASCADE' });
    }
  }
  SpotImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    spotId: DataTypes.INTEGER,
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    preview: DataTypes.BOOLEAN,
    avgRating: {
      type: DataTypes.DECIMAL,
      get() {
        const value = this.avgRating;
        if (typeof value !== 'number' || isNaN(value)) {
          return 0;
        }
        return parseFloat(value.toFixed(1));
      },
      validate: {
        min: 0,
        max: 5,
      },
    }
  }, {
    sequelize,
    modelName: 'SpotImage',
  });
  return SpotImage;
};
