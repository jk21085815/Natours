// const fs = require('fs');
// const mongoose = require('mongoose');
// const Tour = require('./../models/tourModel')
const AppError = require('../utils/appErr');
const tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handelerFactory'); 
const sharp = require('sharp');
const multer = require('multer');
// const router = require('./userRoutes');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
//     );

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image, Please upload only images.', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCaunt: 3}
]);

exports.resizeTourImages = catchAsync( async(req, res, next) => {
    // console.log(req.files);

    if(!req.files.imageCover || !req.files.images) return next()

    // 1)cover image
        req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
        await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`)

        //2) Images
        req.body.images = [];
        // console.log(req.body.images);

        await Promise.all(
            req.files.images.map(async(file, i) =>{
                const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
    
                await sharp(file.buffer)
                    .resize(2000,1333).toFormat('jpeg')
                    .jpeg({quality:90})
                    .toFile(`public/img/tours/${fileName}`)
    
                req.body.images.push(fileName);
            })
        )
    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next();
}

exports.getAllTours = factory.getAll(tour,{path: 'reviews'})
exports.findTour = factory.getOne(tour, {path: 'reviews'});            
exports.updateTour = factory.updateOne(tour);
exports.deleteTour = factory.deleteOne(tour);
exports.addTours = factory.createOne(tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await tour.aggregate([
        {
            $match: {ratingsAverage: {$gte: 3.5}}
        },
        {
            $group: {
                _id: {$toUpper : `$difficulty`},
                numTours: {$sum: 1},
                numRating: { $sum: `ratingQuantity`},
                avgRating: { $avg: `$ratingAverage`},
                avgPrice: {$avg: `$price`},
                minPrice: {$min: `$price`},
                maxPrice: {$max: `$price`}
            }
        },
        {
            $sort:{avgPrice:1}
        },
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})
exports.getMonthlyPlan =catchAsync( async (req,res, next) => {
    const year = req.params.year * 1;
    const plan = await tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id: {$month: `$startDates`},
                numToursStart:{$sum: 1},
                tours: {$push: '$name'}
            }
        },
        {
            $addFields: { month: '$_id'}
        },
        {
            $project:{
                _id: 0
            }
        },
        {
            $sort:{numToursStart: -1}
        },
        {
            $limit:12
        }
    ])
    
    res.status(202).json({
        status:'success',
        data: {
            plan
        }
    })
})
//('/tours-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin =catchAsync( async(req, res, next) =>{
    const{distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;

    if(!lat || !lng)(
        next(new AppError('Please provide latitude and longitude in the format lat, lng', 400))
    )
    const tours = await tour.find({ startLocation: { $geoWithin: {$centerSphere: [[lng, lat], radius]}}})

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data:{
            data: tours
        }
    });
});
///distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async(req, res, next)=> {
    const {latlng , unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    
    if(!lat || !lng){
        next(new AppError('Please provide a latitude and longitudr', 400))
    }

    const distances = await tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1,lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },{
            $project:{
                distance: 1,
                name: 1
            }
        }
    ])
    
    res.status(200).json({
        status: 'success',
        data:{
            data: distances
        }
    });
})