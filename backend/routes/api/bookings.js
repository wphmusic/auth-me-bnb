const express = require("express");
const { Op } = require("sequelize");

const { requireAuth } = require("../../utils/auth");
const { validateBookingBody } = require("../../utils/validation");
const { Booking, Spot, Image} = require("../../db/models");
const { prettifyDateTime, prettifyStartEnd } = require("../../utils/helpers");

const router = express.Router();

// Get current user's bookings
router.get("/current", requireAuth, async (req, res, next) => {
  const userId = req.user.id;

  const bookings = await Booking.findAll({
    where: { userId },
    include: {
      model: Spot,
      attributes: {
        exclude: ["description", "createdAt", "updatedAt"],
      },
      include: {
        model: Image,
        where: { preview: true },
        attributes: [],
      },
    },
  });

  prettifyDateTime(bookings);
  prettifyStartEnd(bookings);

  for (const booking of bookings) {
    // booking.dataValues.startDate = booking.startDate.toISOString().substring(0, 10);
    // booking.dataValues.endDate = booking.endDate.toISOString().substring(0, 10);

    const spotPreviewImage = await Image.findOne({
      where: { imageableId: booking.Spot.id, imageableType: "Spot", preview: true },
      attributes: ["url"],
    });

    booking.Spot.dataValues.previewImage = spotPreviewImage
      ? spotPreviewImage.url
      : null;
  }

  return res.json({ Bookings: bookings });
});

// Edit a booking
router.put("/:id", requireAuth, validateBookingBody, async (req, res, next) => {
  const bookingId = +req.params.id;
  const userId = +req.user.id;
  const { startDate, endDate } = req.body;

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    return next({
      status: 404,
      message: "Booking couldn't be found",
    });
  }

  if (userId !== booking.userId) {
    const err = new Error("Authorization required");
    err.status = 403;
    err.message = "Forbidden";
    return next(err);
  }

  if (booking.endDate <= new Date()) {
    return next({
      status: 403,
      message: "Past bookings can't be modified",
    });
  }

  const conflictBookings = await Booking.findAll({
    where: {
      spotId: booking.spotId,
      [Op.and]: [
        {
          id: { [Op.ne]: bookingId },
        },
        {
          [Op.or]: [
            {
              startDate: {
                [Op.between]: [
                  `${new Date(startDate).toISOString()}`,
                  `${new Date(endDate).toISOString()}`,
                ],
              },
            },
            {
              endDate: {
                [Op.between]: [
                  `${new Date(startDate).toISOString()}`,
                  `${new Date(endDate).toISOString()}`,
                ],
              },
            },
            {
              startDate: { [Op.lte]: startDate },
              endDate: { [Op.gte]: endDate },
            },
          ],
        },
      ],
    },
  });

  if (conflictBookings.length > 0) {
    const errors = [];

    const booking = conflictBookings[0];

    const bookingStart = booking.startDate.toISOString().substring(0, 10);
    const bookingEnd = booking.endDate.toISOString().substring(0, 10);

    if (startDate >= bookingStart && startDate <= bookingEnd) {
      errors.push("Start date conflicts with an existing booking");
    }
    if (endDate >= bookingStart && endDate <= bookingEnd) {
      errors.push("End date conflicts with an existing booking");
    }
    if (startDate < bookingStart && endDate > bookingEnd) {
      errors.push("Booking conflicts with an existing booking");
    }

    return next({
      status: 403,
      message: "Sorry, this spot is already booked for the specified dates",
      errors,
    });
  }

  await booking.update({
    startDate,
    endDate,
  });

  prettifyStartEnd(booking);
  prettifyDateTime(booking);

  return res.json(booking);
});

// Delete a booking
router.delete("/:id", requireAuth, async (req, res, next) => {
  const bookingId = +req.params.id;
  const userId = +req.user.id;

  const booking = await Booking.findByPk(bookingId, {
    include: {
      model: Spot,
      attributes: ["ownerId"],
    },
  });

  if (!booking) {
    return next({
      status: 404,
      message: "Booking couldn't be found",
    });
  }

  if (userId !== booking.userId && userId !== booking.Spot.ownerId) {
    const err = new Error("Authorization required");
    err.status = 403;
    err.message = "Forbidden";
    return next(err);
  }

  const startDate = booking.startDate;
  const endDate = booking.endDate;
  const nowDate = new Date();

  if (nowDate > startDate && nowDate < endDate) {
    return next({
      status: 403,
      message: "Bookings that have been started can't be deleted",
    });
  }

  await booking.destroy();

  return res.json({
    status: 200,
    message: "Successfully deleted",
  });
});
module.exports = router;
