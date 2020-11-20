const express = require('express');
const catchAsync = require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground');
const Review = require('./models/review')
const ejsLint = require('ejs-lint')
const session = require('express-session')
const flash = require('connect-flash')

const { urlencoded } = require('express');
const { allowedNodeEnvironmentFlags, getMaxListeners } = require('process');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')



mongoose.connect('mongodb://localhost:27017/camplist', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", ()=>{
    console.log("Database connected")
})

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)

const sessionConfig = {
    secret: 'badsecret',
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

// how to add a user to a session, added through passport
passport.serializeUser(User.serializeUser())
//how to remove a user from a seesion, also added through passport
passport.deserializeUser(User.deserializeUser())


app.use((req, res, next) =>{
res.locals.success = req.flash('success')
next();
})


const validateCampground = (req, res, next) =>{ 
    const {error} = campgroundSchema.validate(req.body)
    if (error){
    const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)



app.get('/', (req, res)=>{
    res.render('home')
})



app.all('*', (req, res, next) =>{
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next)=>{
    const { statusCode= 500} = err;
    if (!err.message) err.message = 'Oh no, something went wrong :('
    res.status(statusCode).send(err.message);
   
})
app.listen(3000, ()=>{

    console.log('Server is running!')
})