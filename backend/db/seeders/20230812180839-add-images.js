"use strict";
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Images";
    return queryInterface.bulkInsert(
      options,
      [
        {
          url: "https://imgur.com/spotImg1noPrev",
          preview: false,
          imageableId: 1,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/spotImg1Prev",
          preview: true,
          imageableId: 1,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/spotImg2noPrev",
          preview: false,
          imageableId: 2,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/spotImg2Prev",
          preview: true,
          imageableId: 2,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/spotImg3noPrev",
          preview: false,
          imageableId: 3,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/spotImg3Prev",
          preview: true,
          imageableId: 3,
          imageableType: "Spot",
        },
        {
          url: "https://imgur.com/revImg1noPrev",
          preview: false,
          imageableId: 1,
          imageableType: "Review",
        },
        {
          url: "https://imgur.com/revImg1Prev",
          preview: true,
          imageableId: 1,
          imageableType: "Review",
        },
        {
          url: "https://imgur.com/revImg2noPrev",
          preview: false,
          imageableId: 2,
          imageableType: "Review",
        },
        {
          url: "https://imgur.com/revImg2Prev",
          preview: true,
          imageableId: 2,
          imageableType: "Review",
        },
        {
          url: "https://imgur.com/revImg3noPrev",
          preview: false,
          imageableId: 3,
          imageableType: "Review",
        },
        {
          url: "https://imgur.com/revImg3Prev",
          preview: true,
          imageableId: 3,
          imageableType: "Review",
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Images";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, null, {});
  },
};