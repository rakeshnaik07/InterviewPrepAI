const multer = require('multer')
const createHttpError = require('../utils/httpError')

function fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
        return callback(createHttpError(400, 'Only PDF resume uploads are allowed'))
    }

    return callback(null, true)
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize :  3 * 1024 * 1024
    },
    fileFilter
})

module.exports = upload
