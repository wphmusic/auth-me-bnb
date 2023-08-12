const express = require('express');

const { requireAuthentication, respondWith403, respondWithSuccessfulDelete } = require('../../utils/auth');
const { Spot, SpotImage } = require('../../db/models');



const router = express.Router();

async function restoreSpotImage(req, res, next) {
    const spotImage = await SpotImage.findByPk(req.params.imageId);
    if (spotImage) {
        req.spotImage = spotImage;
        const spot = await Spot.findByPk(spotImage.spotId);
        if (spot) req.spot = spot;
        return next();
    }
    respondWithImage404(res);
}

function respondWithImage404(res) {
    res.status(404).json({
        "message": "Spot Image couldn't be found",
        "statusCode": 404
    });
}


router.delete('/:imageId', requireAuthentication, restoreSpotImage, async (req, res) => {
    if (!req.spot || req.spot.ownerId === req.user.id) {
        await req.spotImage.destroy();
        respondWithSuccessfulDelete(res);
    }
    else respondWith403(res);
});

module.exports = router;
