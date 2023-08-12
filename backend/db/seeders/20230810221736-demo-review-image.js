'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    options.tableName = "ReviewImages";
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: 'http://willherringtonreviewimages/1'
      },
      {
        reviewId: 2,
        url: 'http://willherringtonreviewimages/2'
      },
      {
        reviewId: 3,
        url: 'http://willherringtonreviewimages/3'
      },
      {
        reviewId: 4,
        url: 'http://willherringtonreviewimages/4'
      }
      // Add more review image data entries with actual values
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    options.tableName = "ReviewImages";
    return queryInterface.bulkDelete(options, null, {});
  }
};
