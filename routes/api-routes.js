var db = require("../models");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(app){

    app.use(require('cookie-parser')())
    app.use(require('body-parser').urlencoded({ extended: true }))
    app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(function(username, pass, cb){
        var hashedPass = bCrypt.hashSync(pass)
        db.User.findOne({
            where: {
                username: username
            }
        }).then(function(user, err){
            if (err) { 
                return cb(err); 
            }
            if (!user) { 
                return cb(null, false); 
            }
            if (!bCrypt.compareSync(pass, user.password)){ 
                return cb(null, false); 
            }
            return cb(null, user);
        })
    }))

    passport.serializeUser(function(user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(function(id, cb) {
        db.User.findById(id).then(function (user) {
            cb(null, user);
        });
    });

    app.use(function(req,res,next){
        if(req.user){
            res.locals.user = req.user.username
        }
        next()
    });

    app.get("/", function(req, res) {

    });

    app.get("/signout", function(req, res){
        req.session.destroy();
        res.redirect("/");
    });

    app.get("/story/:id", function(req, res) {

    });

    //SEARCH USER
    app.post("/signin", passport.authenticate('local'), function(req, res) {
        console.log("Succesfully signed in.");
        res.redirect('/');
    });

    //SIGN UP USER
    app.post("/signup", function(req, res, next){
        db.User.findOne({
            where: {
                username: req.body.username
            }
        }).then(function(user){
            if(!user){
            db.User.create({
                username: req.body.username,
                password: bCrypt.hashSync(req.body.password)
            }).then(function(user){
                passport.authenticate("local", {failureRedirect:"/signup", successRedirect: "/signup"})(req, res, next)
                return done(null, user);

            })
            } else {
                res.send("user exists");
            }
        })
    })

    app.get("/signup", function(req, res){
        console.log("Successfully signed up.");
        res.redirect("/");
    });

    app.post("/api/new/task", function(req, res) {
        db.ToDo.create({
            task: req.body.task
        }).then(function(results) {
            res.redirect("/");
        });
    });

    app.post("/api/new/", function(req, res) {

    });

    app.post("/api/new/art", upload.single('fileupload'), function (req, res, next) {
       var fileName = "img-Story"+req.body.StoryId+"-Contrib"+req.body.ContributionId+"."+req.file.mimetype.split("/")[1];
       console.log(req.file);
        fsImpl.writeFile(fileName, req.file.buffer, "binary", function (err) {
            if (err) throw(err);
            db.Art.create({
                art_file: 'https://s3.amazonaws.com/chickenscratchdb/'+fileName,
                ContributionId: req.body.ContributionId,
                StoryId: req.body.StoryId
            }).then(function(results) {
                res.redirect("/story/" + req.body.StoryId);
            });
        });
    });
 
    app.get("/api/contributor/:id", function(req, res) {

    });    

    app.get("/api/art/:id", function(req, res) {

    });
}