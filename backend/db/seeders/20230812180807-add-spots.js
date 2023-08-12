'use strict';
/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Spots";
    return queryInterface.bulkInsert(
      options,
      [
        {
          ownerId: '1',
          address: '123 Disney Lane',
          city: 'San Francisco',
          state: 'California',
          country: 'United States of America',
          lat: 37.7645358,
          lng: -122.4730327,
          name: 'App Academy',
          description: 'Place where web devs are created',
          price: 123,
        },
        {
          ownerId: '2',
          address: '222 Testing St',
          city: 'Testing City',
          state: 'California',
          country: 'United States of America',
          lat: 40.7645358,
          lng: 120.4730327,
          name: 'Testing1',
          description: 'Fake User1 Testing Spot',
          price: 1245,
        },
        {
          ownerId: '3',
          address: '333 Testing Ave',
          city: 'Testing Town',
          state: 'California',
          country: 'United States of America',
          lat: 80.7645358,
          lng: -120.4730327,
          name: 'Testing2',
          description: 'Fake User2 Testing Spot',
          price: 1400,
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Spots";
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ['App Academy', 'Testing1', 'Testing2']},
      },
      {}
    );
  },
};
