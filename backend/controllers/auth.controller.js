import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        console.log("Signup");

        const {fullName, username, password, confirmPassword, gender} = req.body;
        if(password !== confirmPassword) 
            return res.status(400).json({message: "Passwords do not match"});  
        
        const user = await User.findOne({username});

        if(user) 
            return res.status(400).json({message: "User already exists"});

        // HASH PASSWORD HERE
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // GENERATE PROFILE PIC HERE
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName,
            username,
            password:hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic
        });

        // Generate JWT Token
        generateTokenAndSetCookie(newUser._id, res);

        // Save user to DB
        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic: newUser.profilePic,
            message: "User created successfully"
        });
        
    } catch (error){
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const login =  async (req, res) => {
    try {
        console.log("Login Route");

        const { username , password} = req.body;

        // Check if user exists
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message: "User does not exist"});
        }

        // Check if password is correct
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid credentials"
            });
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
            message: "User logged in successfully"
        })

    } catch (error){
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0});
        res.status(200).json({message: "User logged out successfully"});

    } catch (error){
        console.log(error);
        res.status(500).json({message: error.message});
    }
}