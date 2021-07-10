const multer = require('multer');
const mime = require('mime-types')

const storage = multer.diskStorage({
    destination: './public/img/user/',
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) 
            + '.' + mime.extension(file.mimetype);
        cb(null, uniqueName);
    }
});

exports.avatarUpload = multer({ storage: storage })