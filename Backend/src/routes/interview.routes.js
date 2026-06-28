const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")
const asyncHandler = require("../utils/asyncHandler")

const interviewRouter = express.Router()



/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", asyncHandler(authMiddleware.authUser), upload.single("resume"), asyncHandler(interviewController.generateInterViewReportController))

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", asyncHandler(authMiddleware.authUser), asyncHandler(interviewController.getInterviewReportByIdController))


/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", asyncHandler(authMiddleware.authUser), asyncHandler(interviewController.getAllInterviewReportsController))


/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", asyncHandler(authMiddleware.authUser), asyncHandler(interviewController.generateResumePdfController))



module.exports = interviewRouter
