"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Booking.belongsTo(models.Spot, {
        foreignKey: "spotId",
      });
    }
  }
  Booking.init(
    {
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true,
          isAfterStartDate(value) {
            if (value <= this.startDate) {
              throw new Error('End date must be after start date');
            }
          }
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
      modelName: "Booking",
    }
  );
  return Booking;
};
