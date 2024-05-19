import express from 'express';
import { User } from './models/user.js'
import { Post } from './models/Posts.js';
import cookieParser from 'cookie-parser';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.render("index");
})

const isLoggedIn = (req, res, next) => {
    if (req.cookies.token === "") res.redirect("/login")
    else {
        let data = jwt.verify(req.cookies.token, "shhhh");
        req.user = data;
        next();
    }
}

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/profile", isLoggedIn, async (req, res) => {
    // console.log(req.user.email);
    let user = await User.findOne({ email: req.user.email}).populate("posts");
    // console.log(user.username);
    res.render("profile",{user}) // Here we send user data to page
})

app.get("/like/:id", isLoggedIn, async (req, res) => {
   
    let post = await Post.findOne({_id: req.params.id}).populate("user");
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    await post.save();
    res.redirect("/profile");
})

app.get("/edit/:id", isLoggedIn, async (req, res) => {
   
    let post = await Post.findOne({_id: req.params.id}).populate("user");

    res.render("edit",{post});
})

app.post("/update/:id", isLoggedIn, async (req, res) => {
   
    let post = await Post.findOneAndUpdate({_id: req.params.id},{content:req.body.content});

    res.redirect("/profile");
})

app.post("/post", isLoggedIn, async (req, res) => {
    let user = await User.findOne({ email: req.user.email})
    let {content} = req.body;

    let post  = await Post.create({
        user:user._id,
        content:content
    })

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile")
})

app.post("/register", async (req, res) => {
    let { email, password, username, name, age } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(500).send("User already registered");

    // Bcrypt used to hash the password 
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            // console.log(hash);
            let createdUser = await User.create({
                username,
                email,
                age,
                name,
                password: hash
            })

            let token = jwt.sign({ email: email, userid: createdUser._id }, "shhhh");
            res.cookie("token", token);
            res.send("registered");

        })
    })

})

app.post("/login", async (req, res) => {
    let { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(500).send("Something Went wrong");

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        }
        else res.redirect("/login");
    })

})

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect("/login")
})



app.listen(4000, () => console.log("App is listen"));