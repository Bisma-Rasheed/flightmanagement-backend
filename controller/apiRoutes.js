const route = require('express').Router();
const mongoose = require('mongoose');

const userSchema = require('../model/flightModel.js')(mongoose);
const userModel = new mongoose.model('Users', userSchema);


const returnRouter = function(app, passport){
    route.get('/', (req, res)=>{
        res.send({message: 'hello from bisma server'});
    })

    return route;
}


module.exports = {
    route: returnRouter
}