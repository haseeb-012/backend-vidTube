import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
 username:{
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
  index: true
 },
 email:{
  type: String,
  required: true,
  unique: true,
  trim: true,
  lowercase: true,
 },
 fullname:{
  type: String,
  required: true,
  trim: true,
  index: true
 },
 avatar:{
  type: String,
  required: true
 },
 coverImage:{
    type: String,
    required: true
 },
 watchHistory:[{type: Schema.Types.ObjectId, ref: "Video"}],

 refreshToken:{
  type: String,

 },
 password:{
  type: String,
  required: [true, "Password is required"]}
},{timestamps:true});

const User = mongoose.model("User", userSchema);

export default User;
