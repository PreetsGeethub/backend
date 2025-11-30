import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {Video} from "../models/video.model.js"
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
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path;


    if(!videoLocalPath){
        throw new ApiError(400,"Video File is Missing")
    }

    const video = await uploadOnCloudinary(videoLocalPath);

    if(!video){
        throw new ApiError(400,"Error While Uploading the Video on Cloudinary")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
;
    if(!thumbnailLocalPath){
        throw new ApiError(400,"thumbnail is missing")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400,"error while uploading the thumbnail")
    }
    let views = 0;
    let isPublished = false
    const videoDoc  = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        views,
        isPublished,
        owner : req.user?._id
    })

    if(!videoDoc){
        throw new ApiError(400,"something went wrong while uploading the video")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,videoDoc ,"Video Uploaded Successfully ")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400,"videoId is not valid")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"video does not exist")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,video,"Video Fetched Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description} = req.body;
    
    

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "Nothing to update");
    }
    let updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    let thumbnail;
    if(thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail){
            throw new ApiError(400,"erro while uploading the thumbnail on cloudinary")
        }
        updateData.thumbnail = thumbnail.url;
    }

   

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:updateData
        },
        {
            new: true,
        }
    )
    if(!video){
        throw new ApiError(400,"erro while updating the video details")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,video,"Video Detail are Updated Successfuly !!")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400,"videoId is not valid")
    }
    
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    await Video.deleteOne({ _id: videoId });

    return res.status(200)
    .json(
        new ApiResponse(200,{},"Video deleted Successfully !!")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is not valid")
    }
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: { $not: ["$isPublished"] }
                }
            }
        ],
        { new: true }
    );
    
    if(!updatedVideo){
        throw new ApiError(400,"video not found")
    }
    res.status(200)
    .json(
        new ApiResponse(200,updatedVideo,"video status has been changed")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}