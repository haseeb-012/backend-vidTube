import User from "../models/user.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadCloudinary,deleteCloudinary} from "../utils/cloudinary.js";

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




export {registerUser};
