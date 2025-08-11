import mongoose from "mongoose";
import User from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadCloudinary,deleteCloudinary} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const genarateAccesandRefreshToken = async(userid)=>{
  try {
    const user = await User.findById(userid);
    if(!user){
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save(
      {
        validateBeforeSave: false
      }
    );
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Internal server error");
  }
}
const registerUser = asyncHandler(async (req, res) => {
  const {fullName, email, password, username} = req.body;

  // validation
  if (
    [fullName, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "ALL fields are required");
  }

  const existingUser = await User.findOne({$or: [{email}, {username}]});

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }
console.log("Files in request:", req.files);
  const avatarLocalPath = req.files.avatar[0]?.path;
  const coverImageLocalPath = req.files.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

 let avatar ;
 try {
    avatar = await uploadCloudinary(avatarLocalPath);
    console.log("Avatar uploaded successfully:", avatar);
 } catch (error) {
    console.error("Error uploading avatar:", error);
    throw new ApiError(500, "Failed to upload avatar");
 }
  let coverImage;
  try {
    coverImage = await uploadCloudinary(coverImageLocalPath);
  } catch (error) {
    console.error("Error uploading cover image:", error);
    throw new ApiError(500, "Failed to upload cover image");
  }
 

 try {
     const user = await User.create({
       fullName,
       email,
       password,
       username: username.toLowerCase(),
       avatar: avatar?.url,
       coverImage: coverImage?.url || "",
     });
   
     const createdUser = await User.findById(user._id).select(
       "-password -refreshToken"
     );
   
     if (!createdUser) {
       throw new ApiError(404, "Something wrong during registration of user");
     }
   
     return res
       .status(201)
       .json(new ApiResponse(200, createdUser, "User registered successfully"));
 } catch (error) {
   console.error("Error registering user:", error);
  if(avatar){
    await deleteCloudinary(avatar.public_id);
  }
  if(coverImage){
    await deleteCloudinary(coverImage.public_id);
  }
  return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
 }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password ,username} = req.body;

  // validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({$or: [{email}, {username}]});
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await genarateAccesandRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const option ={
    httpOnly: true,
    secure : process.env.NODE_ENV === "production"
  }
  return res
  .status(200)
  .cookie("accessToken", accessToken, option)
  .cookie("refreshToken", refreshToken, option)
  .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) =>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);
    if (!user) {
      throw new ApiError(403, "Invalid refresh token");
    }
     if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(403, "Invalid refresh token");
  }
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const { accessToken, refreshToken:newRefreshToken } = await genarateAccesandRefreshToken(user._id);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { user, accessToken }, "Access token refreshed successfully"));

  } catch (error) {
    console.error("Error verifying refresh token:", error);
    throw new ApiError(403, "Invalid refresh token");
  }

 
});

const logoutUser = asyncHandler(async (req, res) => {
  const  userid = req.user?._id;
   await User.findByIdAndUpdate(userid,
    {$set :{
      refreshToken: undefined,

    }},
    {new : true}
   )

   const options = {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
   };
  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, null, "User logged out successfully"));
})

const changeCurrentPassword =asyncHandler(async (req, res) => { 
 const { oldPassword, newPassword } = req.body;

 
  const user = await User.findById(req.user?._id)

  const isMatch = await user.isPasswordCorrect(oldPassword)
  if (!isMatch) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
})

const getCurrentUser =asyncHandler(async (req, res) => { 
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
})

const updateAccountDetails =asyncHandler(async (req, res) => { 
  const { fullName, email, username } = req.body;
  if (!fullName || !email || !username) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        fullName,
        email,
        username
      }
    }, {
      new: true,
    }).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User Update failed");
  }
  return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(400, "Avatar upload failed");
  }
  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    }, {
      new: true
    }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User Update Avatar failed");
  }
  return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
})

const UpdateUserCoverImage =asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    {
      $set: {
        coverImage: coverImageLocalPath
      }
    }, {
      new: true
    }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User Update Cover Image failed");
  }
  return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if(!username){
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match :{
        username
      }
    },{
      $lookup:{
        from: "channels",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },{
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscriberedTo"
      }
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelCount: { $size: "$subscriberedTo" },
        isSubscribed: {
        $cond:{
          if: { $in: [req.user?._id, "$subscriberedTo.subscriber"] },
          then: true,
          else: false
        }
      }
      }, 
    },
    {
      // Project only  the necessary data
      $project: {
        fullName: 1,
        email: 1,
        username: 1,
        avatar: 1,
        subscriberCount: 1,
        channelCount: 1,
        isSubscribed: 1
      }
    }
  ])


  console.log("channel Detail",channel);
  if(!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"));

})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match:{
        _id: mongoose.Types.ObjectId(req.user?._id)
      }
    },{
        $lookup:{
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline:[
            {
              $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                  {
                    $project:{
                      fullName: 1,
                      username: 1,
                      avatar: 1
                    }
                  }
                ]
              }
            },{
              $addFields:{
                owner: { $first: "$owner" }
              }
            }
          ]
        },  
    },
  ])

  return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory, "Watch history fetched successfully"));
})


export {registerUser,loginUser,refreshAccessToken,logoutUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,UpdateUserCoverImage,getUserChannelProfile,getWatchHistory};