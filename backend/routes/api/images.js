const express = require("express");


const {  requireAuth } = require("../../utils/auth");

const { Image } = require("../../db/models");

const router = express.Router();

// Delete spot image/review image
router.delete("/:id", requireAuth, async (req, res, next) => {
  const { id } = req.params;
  const userId = +req.user.id;

  const image = await Image.findByPk(id);

  if (!image) {
    return next({
      status: 404,
      message: "Image couldn't be found",
    });
  }

  const imageType = image.imageableType;

  if (imageType === "Spot") {
    const spot = await image.getSpot();

    if (userId !== spot.ownerId) {
      const err = new Error("Authorization required");
      err.status = 403;
      err.message = "Forbidden";
      return next(err);
    }
  }

  if (imageType === "Review") {
    const review = await image.getReview();

    if (userId !== review.userId) {
      const err = new Error("Authorization required");
      err.status = 403;
      err.message = "Forbidden";
      return next(err);
    }
  }

  await image.destroy();

  return res.json({
    status: 200,
    message: "Successfully deleted",
  });
});

module.exports = router;
