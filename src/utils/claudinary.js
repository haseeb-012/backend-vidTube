import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto'
    });
    console.log('Cloudinary upload result:', result.secure_url);
    //once the file is uploaded, you can delete it from the local storage
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    fs.unlinkSync(filePath); // Clean up the file if upload fails
    console.log('Cloudinary upload error:', error.message);
    return null;
  }
};

export { uploadCloudinary };
