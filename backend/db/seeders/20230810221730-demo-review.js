'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert('Review', [
      {
        userId: '1', 
        spotId: '2', 
        review: 'Great',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: '3', 
        spotId: '4',
        review: 'Great',
        stars: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more review data entries with actual values
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('Review', null, {});
  }
};
