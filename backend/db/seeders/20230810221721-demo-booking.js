'use strict';

let options = {};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Booking';
    return queryInterface.bulkInsert(options, [
      {
        spotId: '1', 
        userId: '2', 
        startDate: new Date('2023-08-15'),
        endDate: new Date('2023-08-20'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        spotId: '3', 
        userId: '4', 
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-09-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more booking data entries with different dates
    ], {});
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Booking';
    return queryInterface.bulkDelete(options, null, {});
  }
};
