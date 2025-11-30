import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const {userId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is not valid")
    }

    const videoStats = await Video.aggregate([
        {
            $match:{ owner: new mongoose.Types.ObjectId(userId) }

        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes",
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum:1},
                totalLikes:{$sum: {$size:"$likes"}},
                totalViews: {$sum:"$views"}
            }
        },{
            $project: {
                totalLikes: 1,
                totalViews: 1,
                totalVideos: 1,
            }
        }
    ])

    const stats = videoStats[0] || {
        totalVideos: 0,
        totalLikes: 0,
        totalViews: 0
    };
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const result = {
        ...stats,
        totalSubscribers
    }
    return res.status(200)
    .json(
        new ApiResponse(200,result,"stats are fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {userId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"userId is not valid")
    }

    const videos = await Video.find({owner:userId});
    
    return res.status(200)
    .json(
        new ApiResponse(200,videos,"Videos are Fetched Successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}