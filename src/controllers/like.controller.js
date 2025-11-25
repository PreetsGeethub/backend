import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/like.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose , {isValidObjectId} from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid videoId");
        }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id,
    })

    if(existingLike){
        await Like.deleteOne({_id: existingLike._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Video unliked successfully!")
        );
    }
    const videoLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id,
    })
    if(!videoLike){
        throw new ApiError(400,"Couldnt Update the Like")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,videoLike,"Like Updated Successfully !!")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400,"commentId is not Valid")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id,
    });
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        return res.status(200).json(
            new ApiResponse(200, null, "Comment unliked successfully!")
        );
    }
    
    const newLike = await Like.create({
        comment:commentId,
        likedBy:req.user?._id,
    })

    if(!newLike){
        throw new ApiError(400,"Couldnt Update the Like")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,newLike,"Like Updated Successfully !!")
    )

})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId is not Valid")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id,
    });
    if(existingLike){
        await Like.deleteOne({_id:existingLike._id});
        return res.status(200).json(
            new ApiResponse(200, null, "Tweet Unliked Successfully!")
        );
    }
    
    const newLike = await Like.create({
        tweet: tweetId,
        likedBy:req.user?._id,
    })

    if(!newLike){
        throw new ApiError(400,"Couldnt Update the Like")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,newLike,"Like Updated Successfully !!")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const user = req.user?._id;
    if(!user){
        throw new ApiError(400,"Invalid User")
    }

    const allVideos = await Like.aggregate([
        { $match: { likedBy: user } },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videoDetails"
          }
        },
        { $unwind: "$videoDetails" }
      ])
      

    if (allVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,allVideos,"All Videos are Fetched Successfully")
    )
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
