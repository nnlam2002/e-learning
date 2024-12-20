import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle: {type:String}, 
    description:{ type:String},
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    courseLevel:{
        type:String,
        enum:["Beginner", "Medium", "Advance"]
    },
    coursePrice:{
        type:Number
    },
    courseThumbnail:{
        type:String
    },
    enrolledStudents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    lectures:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Lecture"
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    averageRating: {
        type: Number,
        default: 0, // Mặc định không có đánh giá
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0 // Số lượng đánh giá
    }

}, {timestamps:true});

export const Course = mongoose.model("Course", courseSchema);