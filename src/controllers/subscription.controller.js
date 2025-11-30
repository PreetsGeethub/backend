import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"channelId is not valid")
    }

    const existSub = await Subscription.findOne({
        channel:channelId,
        subscribers: req.user._id,

    });
    if(existSub){
        await Subscription.deleteOne({_id:existSub._id})
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed Successfully!")
        );
    }

    const newSub = await Subscription.create(
        {
            channel:channelId,
            subscribers: req.User?._id,
            
        }
    )
    return res.status(200)
    .json(200,newSub,"Subscription Added Sucessfully !!")
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400,"channelId is not valid")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{channel: new mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriberDetails"
            }
        },
        {
            $unwind:"$subscriberDetails"
        },
        {
            $project:{
                _id:0,
                subscriber: "$subscriberDetails.username",
                subscriberId: "$subscriberDetails._id",

            }
        }
    ])

    if(subscribers.length===0){
        throw new ApiError(400,[],"No Subscribers Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,subscribers,"Subscribers fetched successfully !! ")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400,"subscriberId is not valid")
    }

    const channels = await Subscription.aggregate([
        {
            $match:{subscriber: new mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channelDetails"
            }
        },
        {
            $unwind:"$channelDetails"
        },
        {
            $project:{
                _id:0,
                subscriber: "$channelDetails.username",
                subscriberId: "$channelDetails._id",

            }
        }
    ])

    if(channels.length===0){
        throw new ApiError(400,[],"No Channels Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,channels,"Channels fetched successfully !! ")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}