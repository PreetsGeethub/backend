import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * currentLimit;

    const comments = await Comment.find({ video: videoId }) //find() never returns null, It returns an empty array[], Empty array is truthy, so this condition will NEVER run
        .limit(currentLimit)
        .skip(skip)
        .sort({ createdAt: -1 })
    // if (comments.length === 0) {
    //     throw new ApiError(400, "No Comments Found")
    // }

    return res.status(200)
        .json(
            new ApiResponse(200, comments, "Comments are Fetched Successfully ")
        )



})
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!content) {
        throw new ApiError(400, "Please Write a Comment ");
    }

    const userComment = await Comment.create({
        content,
        owner: req.user?._id,
        video: videoId
    })

    if (!userComment) {
        throw new ApiError(400, "Something Went Wrong While Saving the File !!")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, userComment, "Comment Added Successfully !!")
        )

})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    // Validate comment id
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    // Validate new content
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }
    
    const comment = await Comment.findById(commentId); //deleteOne() expects a filter object, not an ID.
    if(!comment){
        throw new ApiError(400,"No Comment Found")
    }
    await Comment.deleteOne({ _id: commentId });

    return res.status(200)
    .json(
        new ApiResponse(200,{},"Comment Deleted Successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}