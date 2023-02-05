const route = require('express').Router();
const mongoose = require('mongoose');
const FacebookStrategy = require('passport-facebook');
require('https').globalAgent.options.rejectUnauthorized = false;

const userSchema = require('../model/flightModel.js')(mongoose);
const userModel = new mongoose.model('Users', userSchema);

var userProfile;

const returnRouter = function (passport) {
    route.get('/', (req, res) => {
        res.send({ message: 'hello from server' });
    });

    try {
        passport.use(new FacebookStrategy({
            clientID: '1206221456655136',
            clientSecret: '6ac763f1d8999ff6fb301d9b7554c04b',
            callbackURL: "https://ox-garb.cyclic.app/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'email']
        },
            function (accessToken, refreshToken, profile, done) {
                userProfile = profile;
                return done(null, userProfile);
            }
        ));
    }
    catch (err) {
        console.log(err);
    }

    //facebook auth route
    route.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' })); //when user logs in through facebook

    route.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), async (req, res) => {
        const userData = await userModel.find({ email: userProfile.emails[0].value });
        if (userData[0] === undefined) {
            console.log('I am registering the user through facebook');
            try {
                const newUser = new userModel({
                    facebookID: userProfile.id,
                    name: userProfile.displayName,
                    email: userProfile.emails[0].value
                });
                const result = await newUser.save();
                console.log('user added');
                const fbID = userProfile.id;
                res.redirect('http://localhost:3000/dashboard/' + fbID);
            }
            catch (err) {
                res.send({ error: err });
            }
        }
        //if exists then login
        else {
            const fbID = userProfile.id;
            res.redirect('http://localhost:3000/dashboard/' + fbID);
        }
    });

    route.post('/getuser', async (req, res) => {
        const userData = await userModel.find({ facebookID: req.body.id });
        res.send({ data: userData[0] });
    });

    route.get('/destroysession', (req, res)=>{
        //req.logOut();
        req.session.destroy();
        res.send({message: 'success'});
    });

    // route.post('/addflight', async (req, res) => {
    //     var userData = await userModel.find({ email: req.body.email });
    //     const _id = userData[0]._id;
    //     const obj = {
    //         from: req.body.from,
    //         to: req.body.to,
    //         dateOfDep: req.body.dep,
    //         dateOfArrival: req.body.arr,
    //         flightType: req.body.type
    //     };
    //     userData = await userModel.findByIdAndUpdate(
    //         { _id },
    //         { $push: { flight: obj } },
    //         { new: true }
    //     );
    //     res.send({ data: userData });
    // })

    return route;
}

module.exports = {
    route: returnRouter
}