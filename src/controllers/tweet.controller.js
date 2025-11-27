import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(400,"failed to create tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"tweet created successfully ")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const tweets = await Tweet.find(
        {
            owner:req.user?._id,
        }
    ).sort({createdAt:-1})


    // Tweet.find() never returns null → it returns [] 
    // So check array length
    if (tweets.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No tweets found for this user")
        );
    }
    return res.status(200)
    .json(
        new ApiResponse(200,tweets,"tweets are fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body
    const { tweetId } = req.params;
    if(!content){
        throw new ApiError(400,"content cannot be empty")
    }
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId is not valid")
    }
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id },
        { content },
        { new: true }
    );

    if(!tweet){
        throw new ApiError(400,"couldnt find the tweet")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400,"tweetId is not valid")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id,
    });


    if(!tweet){
        throw new ApiError(400,"tweet couldnt be deleted")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,{},"tweet deleted successfully ")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}