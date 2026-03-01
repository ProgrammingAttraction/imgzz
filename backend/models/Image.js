const mongoose=require("mongoose");

const ImageSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true   
    },
    url:{
        type:String,
        required:true 
    }
},{timestamps:true});

const Image=mongoose.model("Image",ImageSchema);

module.exports=Image;