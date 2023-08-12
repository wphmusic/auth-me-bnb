const express = require('express');
const { requireAuthentication, respondWith403, respondWithSuccessfulDelete } = require('../../utils/auth');
const { Review, Spot, User, SpotImage, ReviewImage } = require('../../db/models');


const router = express.Router();

function respondWithReview404(res) {
    res.status(404).json({
        "message": "Review couldn't be found",
        "statusCode": 404
    });
}

async function restoreReview(req, res, next) {
    const review = await Review.findByPk(req.params.reviewId);
    if (review) {
        req.review = review;
        return next();
    }
    respondWithReview404(res);
}

function requireReviewOwnership(req, res, next) {
    if (req.review.userId === req.user.id) return next();
    respondWith403(res);
}

// ---------------------------------------------------------------

router.delete('/:reviewId', requireAuthentication, restoreReview, requireReviewOwnership, async (req, res) => {
    await req.review.destroy();
    respondWithSuccessfulDelete(res);
});

router.put('/:reviewId', requireAuthentication, restoreReview, requireReviewOwnership, validateReview, async (req, res) => {
    analyzeErrors(req, res, async () => {
        const { review, stars } = req.body;
        const changes = {};
        if (review !== undefined) changes.review = review;
        if (stars !== undefined) changes.stars = stars;
        const record = await req.review.update(changes);
        res.status(200).json(record);
    });
});

router.post('/:reviewId/images', requireAuthentication, restoreReview, async (req, res) => {
    if (req.review.userId != req.user.id) {
        return respondWith403(res);
    }
    const imageCount = await ReviewImage.count({ where: { reviewId: req.params.reviewId } });
    if (imageCount >= 10) {
        return res.status(403).json({
            "message": "Maximum number of images for this resource was reached",
            "statusCode": 403
        });
    }

    const imageRecord = await ReviewImage.create({ reviewId: req.params.reviewId, url: req.body.url });
    delete imageRecord.dataValues.createdAt;
    delete imageRecord.dataValues.updatedAt;
    delete imageRecord.dataValues.reviewId;
    res.json(imageRecord);
});

router.get('/current', requireAuthentication, async (req, res) => {
    const options = {
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: Spot,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                },
                include: {
                    model: SpotImage,
                    attributes: ['url'],
                    where: { preview: true }
                },
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            },
        ],
        where: { userId: req.user.id }
    };
    const reviews = await Review.findAll(options);
    for (let i = 0; i < reviews.length; i++) {
        // TODO: Setup PG locally to find the right Sequelize syntax to avoid this loop
        const review = reviews[i].toJSON();
        if (review.Spot) {
            reviews[i] = review;
            review.Spot.previewImage = review.Spot.SpotImages[0].url;
            delete review.Spot.SpotImages;
            delete review.Spot.description;
        }
    }
    res.json({ Reviews: reviews });
});

module.exports = router;
