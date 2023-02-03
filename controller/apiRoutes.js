const route = require('express').Router();
const mongoose = require('mongoose');
const FacebookStrategy = require('passport-facebook');

const userSchema = require('../model/flightModel.js')(mongoose);
const userModel = new mongoose.model('Users', userSchema);

var userProfile;

const returnRouter = function(passport){
    route.get('/', (req, res)=>{
        res.send({message: 'hello from bisma server'});
    });

    passport.use(new FacebookStrategy({
        clientID: '1206221456655136',
        clientSecret: '6ac763f1d8999ff6fb301d9b7554c04b',
        callbackURL: "http://localhost:3001/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'email']
    },
    function(accessToken, refreshToken, profile, done){
        userProfile=profile;
        //console.log(userProfile);
        return done(null, userProfile);
    }
    ));

    //facebook auth route
    route.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' })); //when user logs in through facebook

    route.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/'}), async (req, res)=>{
        //console.log(userProfile)
        const userData = await userModel.find({email: userProfile.emails[0].value});
        console.log(userData[0]);
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
                const user = await userModel.find({email: userProfile.emails[0].value});
                res.send({data: user});
            }
            catch(err){
                res.send({error: err});
            }
        }
        //if exists then login
        else{
            console.log('I am logging in the user through facebook');
            const user = await userModel.find({email: userProfile.emails[0].value});
            res.send({data: user});
        }
    });

    return route;
}


module.exports = {
    route: returnRouter
}