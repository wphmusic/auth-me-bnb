'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Bookings";
    return queryInterface.bulkInsert(
      options,
      [
        {
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-01-06"),
          userId: "1",
          spotId: "1"
        },
        {
          startDate: new Date("2023-01-01"),
          endDate: new Date("2023-01-03"),
          userId: "2",
          spotId: "2"
        },
        {
          startDate: new Date("2023-02-02"),
          endDate: new Date("2023-02-05"),
          userId: "3",
          spotId: "3"
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Bookings";
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
