import mongoose,{Schema} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

commentSchema.plugin(mongoosePaginate);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
