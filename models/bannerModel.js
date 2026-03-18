import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
    bannerPicture: { type: String, required:true }, // URL or path to the image

});

const bannerModal = mongoose.model('banner', bannerSchema);
export default bannerModal;