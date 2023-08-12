const express = require('express');

const { requireAuthentication, respondWith403, respondWithSuccessfulDelete } = require('../../utils/auth');
const {  Review, ReviewImage, } = require('../../db/models');
;


const router = express.Router();

async function restoreReviewImage(req, res, next) {
    const reviewImage = await ReviewImage.findByPk(req.params.imageId);
    if (reviewImage) {
        req.reviewImage = reviewImage;
        const review = await Review.findByPk(reviewImage.reviewId);
        if (review) req.review = review;
        return next();
    }
    respondWithImage404(res);
}

function respondWithImage404(res) {
    res.status(404).json({
        "message": "Review Image couldn't be found",
        "statusCode": 404
    });
}

router.delete('/:imageId', requireAuthentication, restoreReviewImage, async (req, res) => {
    if (!req.review || req.review.userId === req.user.id) {
        await req.reviewImage.destroy();
        respondWithSuccessfulDelete(res);
    }
    else respondWith403(res);
});

module.exports = router;
