var mongoose = require("mongoose");
var moviesSchema=new mongoose.Schema({
      movie:String,
      watched:Boolean,
})
module.exports=mongoose.model("Movies",moviesSchema);