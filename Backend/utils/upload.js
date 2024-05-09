const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config();
function upload(){
    const storage = new GridFsStorage({
        url: process.env.MONGO_DB_URI,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                const filename = file.originalname;
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        }
    });
    return multer({ storage });
}

module.exports= {upload}