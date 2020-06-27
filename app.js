var express                 =require("express");
var app                     =express();
var request                 =require("request");
var passport                =require("passport");
var mongoose                =require("mongoose");
var LocalStrategy           =require("passport-local");
var User                    =require("./models/user");
var Movies                  =require("./models/movies")
var passportlocalmongoose   =require("passport-local-mongoose");
var bodyparser              =require("body-parser");

mongoose.connect("mongodb://localhost/moviedb", { useNewUrlParser: true , useUnifiedTopology: true });
app.use(require("express-session")({
    secret: "password",
    resave:false,
    saveUninitialized:false
}));
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("/public"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    //console.log(req.user);
    next();
});

/////////
// ROUTES
/////////
app.get("/",function(req,res){
    res.render("landing");

});
app.get("/results/:pg",function(req,res){
    var pg=req.params.pg;
    var search=req.query.search;
    url="http://www.omdbapi.com/?s="+search+"&page="+pg+"&apikey=65173a3d"
    request(url,function(err,response,body){
        if(!err && response.statusCode==200)
        {
            var data=JSON.parse(body);
            res.render("results",{data:data,search:search,pg:pg});
        }
    });
});

app.get("/info/:id",function(req,res){
    var id=req.params.id;
    urlid="http://www.omdbapi.com/?i="+id+"&plot=full&apikey=65173a3d"
    request(urlid,function(err,response,body){
        if(!err)
        {
            var info=JSON.parse(body);
            res.render("info",{info:info});
        }
    });
/////////
// ROUTES for REGISTER
/////////
});
app.get("/register",function(req,res){
    res.render("register")
});
app.post("/register",function(req,res){
    var newUser=new User({username :req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register"); 
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/");
        });
    });
});
/////////
// ROUTES for login
/////////
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/login"}),function(req,res){

});

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});
/////////
// ROUTES for Watchlist
/////////
app.get("/add/:id",isLoggedIn,function(req,res){
    var id=req.params.id;
    urlid="http://www.omdbapi.com/?i="+id+"&plot=full&apikey=65173a3d"
    request(urlid,function(err,response,body){
        if(!err)
        {
            var info=JSON.parse(body);
            Movies.create({movie:info["Title"],watched:false},function(err,movie){
                if(err){
                    console.log(err);
                }
                else{
                    User.findById(req.user.id,function(err,thisUser){
                        if(err)
                        {
                            console.log(err);
                        }
                        else{
                            thisUser.watchlist.push(movie);
                            thisUser.save();
                            res.redirect("/watchlist");
                        }
                    });
                }
            });
        }
    });
});
app.get("/watchlist",isLoggedIn,function(req,res){
    User.findById(req.user.id).populate("watchlist").exec(function(err,founduser){
        if(err){
            console.log(err);
        }
        else{
            res.render("watchlist",{watchlist:founduser.watchlist});
        }
    });
});
app.get("/watchlist/:id",function(req,res){
    Movies.findById(req.params.id,function(err,foundMovie){
        if(err){console.log(err);}
        else{
            Movies.findByIdAndUpdate(req.params.id,{movie:foundMovie.movie,watched:true},function(err,updatedMovie){
                if(err){console.log(err);}
                res.redirect("/watchlist")
        });
    }
});
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000,function(){
    console.log("Moviedb started");
});