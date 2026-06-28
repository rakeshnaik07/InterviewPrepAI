const multer = require("multer")

function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
    error.status = 404
    next(error)
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error)
    }

    let statusCode = error.status || error.statusCode || 500
    let message = statusCode >= 500 ? "Internal server error" : error.message

    if (error instanceof multer.MulterError) {
        statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400
        message = error.code === "LIMIT_FILE_SIZE"
            ? "Resume file must be 3MB or smaller"
            : "Invalid file upload"
    }

    if (error.name === "CastError") {
        statusCode = 400
        message = "Invalid resource id"
    }

    if (error.code === 11000) {
        statusCode = 409
        message = "Account already exists"
    }

    if (statusCode >= 500) {
        console.error(error)
    }

    return res.status(statusCode).json({
        message,
        ...(Array.isArray(error.issues) ? { issues: error.issues } : {}),
        ...(error.details ? { details: error.details } : {})
    })
}

module.exports = {
    notFoundHandler,
    errorHandler
}
