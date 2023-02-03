module.exports = (mongoose) => {
    const User = new mongoose.Schema({
        facebookID: String,
        name: String,
        email: String,
        flight: [
            {
                from: String,
                to: String,
                dateOfDep: String,
                dateOfArrival: String,
                flightType: {
                    type: String,
                    enum: ['economy', 'business']
                }
            }
        ]
    });

    return User;
}