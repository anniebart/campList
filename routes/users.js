const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync')
const passport = require('passport')


router.get('/register', (req, res)=>{
    res.render('Auth/register')
})

router.post('/register', catchAsync(async (req, res)=>{
   try{const {email, username, password} = req.body
    const user = new User({email, username})
     const registeredUSer = await user.register(user, password)
     req.flash('success', 'Welcome to CampList')
     res.redirect('/campgrounds')
    }
     catch(e){
         req.flash('error', e.message)
         res.redirect('/register')
     }
    console.log(registeredUser)
    
}))

router.get('/login', (req, res)=>{
res.render('Auth/login')
})

router.post('/login', passport.authenticate('local', {failureFlash:true}),(req, res)=>{
req.flash('success',' welcome back!')
res.redirect('/campgrounds')
})

module.exports = router