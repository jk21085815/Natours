const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appErr');
const APIFeatures = require('./../utils/apFeatures');

exports.deleteOne = Model => catchAsync( async (req,res, next) => {
    
    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError("No doc Found With That Id", 404))
     }
    res.status(200).json({
        status : "success",
        data: null
    })
})

exports.updateOne = Model => catchAsync( async (req,res, next) => {
    
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });
    if(!doc){
        return next(new AppError("No document Found With That Id", 404))
     }
    res.status(200).json({
        status : "success",
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async(req, res, next)=>{
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        status : "success",
        data: { 
            data : newDoc
        }
    })
})


exports.getOne = (Model, PopOptions) => catchAsync(async (req, res, next)=>{
    let query = Model.findById(req.params.id);
    if(PopOptions) query = query.populate(PopOptions);
    const doc = await query;
    
        if(!doc){
            return next(new AppError("No Tour document With That Id", 404))
        }
    res.status(200).json({
        status: 'success',
        result: doc.length,
        requestedat: req.requestTime,
        data: {
            data: doc
            }
        })
    })

exports.getAll = (Model, PopOptions) => catchAsync(async  (req, res, next)=>{
    //EXECUTE THE QUERY

    //to allow nested get review on tour
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId};
    const features = new APIFeatures(Model.find(filter), req.query)
    .filters()
    .sort()
    .limitFields()
    .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;
    
    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        result: doc.length,
        requestedat: req.requestTime,
        data: {
            data: doc
        }
    })
})