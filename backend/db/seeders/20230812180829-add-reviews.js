'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";
    return queryInterface.bulkInsert(
      options,
      [
        {
          review: 'lots of text go here for the review content',
          stars: 5,
          userId: 1,
          spotId: 1,
        },
        {
          review: 'text goes here for the review content',
          stars: 4,
          userId: 2,
          spotId: 2,
        },
        {
          review: 'some text goes here for the review content',
          stars: 3,
          userId: 3,
          spotId: 3,
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        id: { [Op.in]: ['1', '2', '3'] },
      },
      {}
    );
  },
};
