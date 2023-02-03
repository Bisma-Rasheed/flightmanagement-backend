const route = require('express').Router();
const mongoose = require('mongoose');
const FacebookStrategy = require('passport-facebook');
require('https').globalAgent.options.rejectUnauthorized = false;

const userSchema = require('../model/flightModel.js')(mongoose);
const userModel = new mongoose.model('Users', userSchema);

var userProfile;

const returnRouter = function(passport){
    route.get('/', (req, res)=>{
        res.send({message: 'hello from server'});
    });

    try{
        passport.use(new FacebookStrategy({
            clientID: '1206221456655136',
            clientSecret: '6ac763f1d8999ff6fb301d9b7554c04b',
            callbackURL: "http://localhost:3001/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'email']
        },
        function(accessToken, refreshToken, profile, done){
            userProfile=profile;
            return done(null, userProfile);
        }
        ));
    }
    catch(err){
        console.log(err);
    }

    //facebook auth route
    route.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' })); //when user logs in through facebook

    route.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/'}), async (req, res)=>{
        const userData = await userModel.find({email: userProfile.emails[0].value});
        if(userData[0]===undefined){
            console.log('I am registering the user through facebook');
            try{
                const newUser = new userModel({
                    facebookID: userProfile.id,
                    name: userProfile.displayName,
                    email: userProfile.emails[0].value
                });
                const result = await newUser.save();
                console.log('user added');
                const email = userProfile.emails[0].value;
                res.redirect('http://localhost:3000/dashboard/'+email);
            }
            catch(err){
                res.send({error: err});
            }
        }
        //if exists then login
        else{
            const email = userProfile.emails[0].value;
            res.redirect('http://localhost:3000/dashboard/'+email);
        }
    });

    route.post('/getuser', async (req, res)=>{
        const userData = await userModel.find({email: req.body.email});
        res.send({data: userData[0]});
    })

    return route;
}

module.exports = {
    route: returnRouter
}