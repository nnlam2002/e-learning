import mongoose from "mongoose"
const reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },
    comment:{
        type:String,
    },
    star:{
        type:Number,
        min:1,
        max:5,
        required: true,
    }
}, {timestamps:true});
export const Review = mongoose.model("Review", reviewSchema);