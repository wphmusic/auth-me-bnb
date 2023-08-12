const express = require("express");

const { requireAuth } = require("../../utils/auth");
const { validateReviewBody } = require("../../utils/validation");
const { User, Spot, Review, Image, sequelize } = require("../../db/models");
const { prettifyDateTime } = require("../../utils/helpers");

const router = express.Router();

// Get current reviews
router.get("/current", requireAuth, async (req, res, next) => {
  const userReviews = await Review.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        include: [
          {
            model: Image,
            attributes: [],
            where: { preview: true },
          },
        ],
        attributes: {
          exclude: ["description", "createdAt", "updatedAt"],
        },
      },
      {
        model: Image,
        attributes: ["id", "url"],
        as: "ReviewImages",
      },
    ],
  });

  prettifyDateTime(userReviews);

  for (const review of userReviews) {
    const spotPreviewImage = await Image.findOne({
      where: { imageableId: review.Spot.id, imageableType: "Spot", preview: true },
      attributes: ["url"],
    });

    review.Spot.dataValues.previewImage = spotPreviewImage
      ? spotPreviewImage.url
      : null;
  }

  return res.json({ Reviews: userReviews });
});

// Add image to review
router.post("/:id/images", requireAuth, async (req, res, next) => {
  const { url } = req.body;
  const reviewId = req.params.id;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);

  if (!review) {
    return next({
      status: 404,
      message: "Review couldn't be found",
    });
  }

  if (userId !== review.userId) {
    const err = new Error("Authorization required");
    err.status = 403;
    err.message = "Forbidden";
    return next(err);
  }

  const imageData = await Image.findAll({
    where: { imageableId: reviewId, imageableType: "Review" },
    attributes: [[sequelize.fn("COUNT", sequelize.col("id")), "imageCount"]],
  });

  if (imageData[0].dataValues.imageCount >= 10) {
    return next({
      status: 400,
      message: "Maximum number of images for this resource was reached",
    });
  }

  const newImage = await Image.create({
    url,
    preview: false,
    imageableId: reviewId,
    imageableType: "Review",
  });

  return res.json({ id: newImage.id, url });
});

// Edit a review
router.put("/:id", requireAuth, validateReviewBody, async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { review, stars } = req.body;

  const oldReview = await Review.findByPk(id);

  if (!oldReview) {
    return next({
      status: 404,
      message: "Review couldn't be found",
    });
  }

  if (userId !== oldReview.userId) {
    const err = new Error("Authorization required");
    err.status = 403;
    err.message = "Forbidden";
    return next(err);
  }

  const updatedReview = await oldReview.update({
    review,
    stars,
  });

  prettifyDateTime(updatedReview);

  return res.json(updatedReview);
});

// Delete a review
router.delete("/:id", requireAuth, async (req, res, next) => {
  const reviewId = req.params.id;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);

  if (!review) {
    return next({
      status: 404,
      message: "Review couldn't be found",
    });
  }

  if(userId !== review.userId) {
    const err = new Error("Authorization required");
    err.status = 403;
    err.message = "Forbidden";
    return next(err);
  }

  await review.destroy();

  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

module.exports = router;
