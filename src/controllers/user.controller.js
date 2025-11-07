import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from  "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from  "../utils/ApiResponse.js"
const registerUser = asyncHandler( async (req,res)=>{
    const {fullname,username,password,email} = req.body
    console.log("username:",username)
    console.log("email:",email)

    if (
        [fullname,username,email,password].some((field) => {
            field?.trim()===""
        })
    ) {
        throw new ApiError(400,"All field are required");
        
    }

    const existedUser = User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with eamil or username already exists")
    }
    console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"avatar image is required")
    }

    const user = await User.create({
        fullname,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User regisetered successfully")
    )
})

export  {registerUser}  