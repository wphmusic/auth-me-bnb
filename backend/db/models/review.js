'use strict';

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      this.belongsTo(models.Spot, { foreignKey: 'spotId', as: 'Spot' });
      this.hasMany(models.ReviewImage, { foreignKey: 'reviewId', as: 'ReviewImages', onDelete: 'CASCADE' });
      this.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    }
  }

  const formatCreatedAt = (date) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  };

  Review.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Spot',
        key: 'id',
      },
    },
    review: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    stars: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5,
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return formatCreatedAt(this.createdAt);
      },
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      get() {
        return formatCreatedAt(this.updatedAt);
      },
    },
  }, {
    sequelize,
    modelName: 'Review',
  });

  return Review;
};
