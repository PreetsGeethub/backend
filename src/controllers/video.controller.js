import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from  "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from  "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const skip = (currentPage - 1) * currentLimit;

    let filter = {};

    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }

    if (userId) {
        filter.owner = userId;
    }

    let sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const videos = await Video.find(filter)
                             .sort(sort)
                             .skip(skip)
                             .limit(currentLimit);

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully")
    );

    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}