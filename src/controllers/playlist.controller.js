import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist
    if((!name || !description)){
        throw new ApiError(400,"name or description is not valid")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    })

    if(!playlist){
        throw new ApiError(400,"Playlist Couldnt Created")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist Created Successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid userId");
    }
    

    const playlists = await Playlist.find({
        owner: userId,
    })

    if (playlists.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No playlists found for this user")
        );
    }
    

    return res.status(200)
    .json(
        new ApiResponse(200,playlists,"Playlists are Fetched Successfully")
    )
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"playlistId is not defined")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        return res.status(200).json(
            new ApiResponse(200, [], "No playlists found for this plalistId")
        );
    }
    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist Fetched Successfully ")
    )
    
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video =  await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {videos: videoId},
        },
        {
            new: true,
        }
    )
    if (!video) {
        throw new ApiError(404, "Video Couldnt added Successfully");
    }
    return res.status(200)
    .json(
        new ApiResponse(200,video," Video Added Successfully")
    )
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"Playlist Does not Found")
    }
    const video = await Playlist.findByIdAndUpdate(
        playlistId,
            {$pull: {videos: videoId}},
            {new : true}
        
    );
    if(!video){
        throw new ApiError(400,"Video Does not Found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,{},"Video Removed Successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.deleteOne({_id:playlistId}); //deleteOne() always returns an object, never null.
    if (!playlist) {
        throw new ApiError(400,"Playlist Does not Found")
    }

    if (playlist.deletedCount === 0) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200)
    .json(new ApiResponse(200, {}, "Playlist Deleted Successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if((!name || !description)){
        throw new ApiError(400,"name or description is not valid")
    }

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description,
        },{
            new: true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    return res.status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist Updated Successfully")
    )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}