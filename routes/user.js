var userRouter = require('express').Router();

userRouter.get('/', function (req, res) {
    console.log("Oeeeeeee!!");
    res.status(200).send("hola champion");
});

module.exports = userRouter;
