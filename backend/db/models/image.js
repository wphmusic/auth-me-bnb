"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    getImageable(options) {
      if (!this.imageableType) return Promise.resolve(null);
      const methodName = `get${this.imageableType}`;
      return this[methodName](options);
    }

    static associate(models) {
      Image.belongsTo(models.Spot, {
        foreignKey: "imageableId",
        constraints: false,
      });
      Image.belongsTo(models.Review, {
        foreignKey: "imageableId",
        constraints: false,
      });
    }
  }
  Image.init(
    {
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: true,
        },
      },
      preview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      imageableId: {
        type: DataTypes.INTEGER,
      },
      imageableType: {
        type: DataTypes.ENUM("Spot", "Review"),
      },
    },
    {
      sequelize,
      modelName: "Image",
    }
  );
  return Image;
};
