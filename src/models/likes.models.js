import mongoose from 'mongoose';

// Like Schema for comments, videos, and tweets
const LikeSchema = new mongoose.Schema({
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        default: null,
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null,
    },
}, {
    timestamps: true,
});

const Like = mongoose.model('Like', LikeSchema);

export default Like;
