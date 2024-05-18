import mongoose, { mongo } from "mongoose";

const postSchema = mongoose.Schema({
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" 
    },
    date:{
        type:Date,
        default: Date.now
    },
    content:String,
    likes:[
        {type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }

    ]
})

export const Post = mongoose.model("post",postSchema);
    