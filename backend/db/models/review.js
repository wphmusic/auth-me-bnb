"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Review.belongsTo(models.Spot, {
        foreignKey: "spotId",
      });
      Review.hasMany(models.Image, {
        foreignKey: "imageableId",
        constraints: false,
        scope: {
          imageableType: "Review",
        },
        as: "ReviewImages"
      });
      Review.hasMany(models.Image, {
        foreignKey: "imageableId",
        constraints: false,
        scope: {
          imageableType: "Review",
        },
      });
    }
  }
  Review.init(
    {
      review: {
        type: DataTypes.TEXT,
      },
      stars: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      spotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Review",
    }
  );
  return Review;
};
