const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas.js')

const validateCampground = (req, res, next) =>{ 
    const {error} = campgroundSchema.validate(req.body)
    if (error){
    const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

router.get('/', catchAsync(async (req, res) =>{
    const campgrounds = await Campground.find({})
   
    res.render('campgrounds/index', { campgrounds });
}))


router.get('/new', (req, res)=>{
   
   res.render('campgrounds/new')
})
router.get('/:id/edit', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id)
    if (!campground){
        req.flash(['error', 'cannot find that campground :('])
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
 }))

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if (! req.body.campground) throw new ExpressError('Invalid campground data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'successfully made new campground!')
    res.redirect(`/campgrounds/${campground._id}`)

}))
router.get('/:id', catchAsync(async (req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    if (!campground){
        req.flash(['error', 'cannot find that campground :('])
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}));

router.put('/:id', catchAsync(async (req, res) =>{
    const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
   
   req.flash('success', 'successfully updated campground!')
   res.redirect(`/campgrounds/${campground._id}`)

}))

router.delete('/:id', catchAsync(async (req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'succesfully deleted review')
    res.redirect('/campgrounds')
}))

module.exports = router