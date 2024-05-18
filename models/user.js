import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/MINI_APP");

const userSchema = mongoose.Schema({
    username:{
        type:String,
        unique:true
    },
    email: String,
    age : Number,
    password:String,
    posts:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
})

export const User = mongoose.model('user',userSchema);
    