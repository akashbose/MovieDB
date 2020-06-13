var express        =require("express");
var app            =express();
var request        =require("request")

app.set("view engine","ejs");

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

});

app.listen(3000,function(){
    console.log("Moviedb started");
});