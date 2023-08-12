const express = require('express');

const { requireAuthentication, respondWith403, respondWithSuccessfulDelete } = require('../../utils/auth');
const { Spot, Review, SpotImage, User, ReviewImage, Booking } = require('../../db/models');
const { Op } = require('sequelize');

const router = express.Router();

async function restoreSpot(req, res, next) {
    const spot = await Spot.findByPk(req.params.spotId);
    if (spot) {
        req.spot = spot;
        return next();
    }
    respondWithSpot404(res);
}

function respondWithSpot404(res) {
    res.status(404).json({
        "message": "Spot couldn't be found",
        "statusCode": 404
    });
}

async function requireSpotOwnership(req, res, next) {
    if (req.user.id === req.spot.ownerId) return next();
    respondWith403(res);
}

async function getSpots(req, filterByCurrentUser = false) {
    const options = {
        include: [Review, { model: SpotImage, where: { preview: true }, required: false }],
        where: {}
    }

    if (filterByCurrentUser) options.where.ownerId = req.user.id;
    else {
        let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
        page = page ? +page : 1;
        size = size ? +size : 100;
        req.query.page = page;
        req.query.size = size;
        options.limit = size;
        options.offset = (page - 1) * size;

        if (minLat && maxLat) options.where.lat = { [Op.between]: [+minLat, +maxLat] };
        else if (minLat) options.where.lat = { [Op.gte]: +minLat };
        else if (maxLat) options.where.lat = { [Op.lte]: +maxLat };

        if (minLng && maxLng) options.where.lng = { [Op.between]: [+minLng, +maxLng] };
        else if (minLng) options.where.lng = { [Op.gte]: +minLng };
        else if (maxLng) options.where.lng = { [Op.lte]: +maxLng };

        if (minPrice && maxPrice) options.where.price = { [Op.between]: [+minPrice, +maxPrice] };
        else if (minPrice) options.where.price = { [Op.gte]: +minPrice };
        else if (maxPrice) options.where.price = { [Op.lte]: +maxPrice };
    }

    const spots = await Spot.findAll(options);
    for (let i = 0; i < spots.length; i++) {
        const spot = spots[i].toJSON();
        spots[i] = spot;

        spot.previewImage = spot.SpotImages.length ? spot.SpotImages[0].url : null;
        delete spot.SpotImages;

        const avgRating = (spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length).toFixed(1);
        spot.avgRating = spot.Reviews.length ? avgRating : null;
        delete spot.Reviews;
    }

    return spots;
}

router.get('/', validateSpotQuery, async (req, res) => {
    analyzeErrors(req, res, async () => {
        res.json({ Spots: await getSpots(req), page: req.query.page, size: req.query.size });
    })
});

router.get('/current', requireAuthentication, async (req, res) => {
    res.json({ Spots: await getSpots(req, true) });
});

router.post('/', requireAuthentication, validateSpot, async (req, res) => {
    analyzeErrors(req, res, async () => {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        const record = await Spot.create({ ownerId: req.user.id, address, city, state, country, lat, lng, name, description, price });
        res.status(201).json(record);
    })
});

router.put('/:spotId', requireAuthentication, restoreSpot, requireSpotOwnership, validateSpot, async (req, res) => {
    analyzeErrors(req, res, async () => {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        const spot = await req.spot.update({ address, city, state, country, lat, lng, name, description, price });
        res.status(200).json(spot);
    })
});

router.get('/:spotId', async (req, res) => {
    const options = {
        include: [
            {
                model: SpotImage,
                attributes: ['id', 'url', 'preview']
            },
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            Review
        ]
    };
    let spot = await Spot.findByPk(req.params.spotId, options);
    if (!spot) return respondWithSpot404(res);

    spot = spot.toJSON();
    spot.numReviews = spot.Reviews.length;
    const avgStarRating = (spot.Reviews.reduce((sum, review) => sum + review.stars, 0) / spot.Reviews.length).toFixed(1);
    spot.avgStarRating = spot.Reviews.length ? avgStarRating : null;
    delete spot.Reviews;

    spot.Owner = spot.User;
    delete spot.User;

    res.json(spot);
});

router.post('/:spotId/images', requireAuthentication, restoreSpot, requireSpotOwnership, async (req, res) => {
    const { url, preview } = req.body;
    const spot = req.spot;

    let image = await SpotImage.create({ spotId: spot.id, url, preview });
    image = image.toJSON();
    delete image.createdAt;
    delete image.updatedAt;
    delete image.spotId;
    res.json(image);
});

router.delete('/:spotId', requireAuthentication, restoreSpot, requireSpotOwnership, async (req, res) => {
    await req.spot.destroy();
    respondWithSuccessfulDelete(res);
});

router.get('/:spotId/reviews', restoreSpot, async (req, res) => {
    const options = {
        include: [
            {
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: ReviewImage,
                attributes: ['id', 'url']
            },
        ],
        where: { spotId: req.params.spotId }
    };
    const reviews = await Review.findAll(options);
    for (let i = 0; i < reviews.length; i++) {
        // TODO: Setup PG locally to find the right Sequelize syntax to avoid this loop
        const review = reviews[i].toJSON();
        if (review.Spot) {
            reviews[i] = review;
            review.Spot.previewImage = review.Spot.SpotImages[0].url;
            delete review.Spot.SpotImages;
        }
    }
    res.json({ Reviews: reviews });
});

router.post('/:spotId/reviews', requireAuthentication, restoreSpot, validateReview, async (req, res) => {
    const oldReview = await Review.findOne({ where: { userId: req.user.id, spotId: req.params.spotId } });
    if (oldReview) {
        return res.status(403).json({
            "message": "User already has a review for this spot",
            "statusCode": 403
        })
    }

    analyzeErrors(req, res, async () => {
        const { review, stars } = req.body;
        const record = await Review.create({ userId: req.user.id, spotId: req.params.spotId, review, stars });
        res.status(201).json(record);
    })
})

router.get('/:spotId/bookings', requireAuthentication, restoreSpot, async (req, res) => {
    const isOwner = req.user.id === req.spot.ownerId;

    if (isOwner) {
        const options = {
            where: { spotId: req.params.spotId },
            include: { model: Spot, include: { model: User, attributes: ['id', 'firstName', 'lastName'] } }
        };
        const bookings = await Booking.findAll(options);
        for (let i = 0; i < bookings.length; i++) {
            const booking = bookings[i].toJSON();
            if (booking.Spot) {
                bookings[i] = booking;
                booking.User = booking.Spot.User;
                delete booking.Spot;
            }
        }
        res.json({ Bookings: bookings });
    } else {
        const options = {
            where: { spotId: req.params.spotId },
            attributes: ['spotId', 'startDate', 'endDate']
        };
        const bookings = await Booking.findAll(options);
        for (let i = 0; i < bookings.length; i++) {
            const booking = bookings[i].toJSON();
            if (booking.Spot) {
                bookings[i] = booking;
                booking.User = booking.Spot.User;
                delete booking.Spot;
            }
        }
        res.json({ Bookings: bookings });
    }
});

router.post('/:spotId/bookings', requireAuthentication, restoreSpot, validateBooking, async (req, res) => {
    if (req.user.id === req.spot.ownerId) return respondWith403(res);  // Don't let owner book
    analyzeErrors(req, res, async () => {
        const { startDate, endDate } = req.body;
        const record = await Booking.create({ userId: req.user.id, spotId: req.params.spotId, startDate, endDate });
        res.status(200).json(record);
    });
});

module.exports = router;
