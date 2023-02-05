const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./controller/apiRoutes');

const passport = require('passport');
const session = require('express-session');

//express session initialization
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
    }));
    
//passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb){
    cb(null, user);
});
passport.deserializeUser(function(obj, cb){
    cb(null, obj);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.set("strictQuery", false);

mongoose.connect(`mongodb+srv://BismaRasheed:bisma@cluster0.pnt338c.mongodb.net/FlightManagement`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connection successful..');
}).catch((err) => console.log(err));

dotenv.config();
const port = process.env.PORT;

app.use('/', routes.route(passport));

app.listen(port, ()=>{
    console.log(`server is listening on ${port}`)
})