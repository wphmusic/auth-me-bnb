'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert('Spot', [
      {
        ownerId: '1', 
        address: '612 Bath St',
        city: 'Metairie',
        state: 'LA',
        country: 'USA',
        lat: 1,
        lng: -1,
        name: 'Red House',
        description: 'A red brick house',
        price: 100.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: '2', 
        address: '6048 Catina St',
        city: 'New Orleans',
        state: 'LA',
        country: 'USA',
        lat: 1,
        lng: -1,
        name: 'Windsor Court',
        description: 'Room 224 with double bed',
        price: 500.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Add more spot data entries with actual values
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('Spot', null, {});
  }
};
