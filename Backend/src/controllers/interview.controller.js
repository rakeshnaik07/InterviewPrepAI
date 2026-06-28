const { PDFParse } = require("pdf-parse")
const mongoose = require("mongoose")
const interviewReportModel = require("../models/interviewReport.model")
const {generateInterviewReport, generateResumePdf} = require("../services/ai.service")
const createHttpError = require("../utils/httpError")

function normalizeText(value) {
    if (value === undefined || value === null) {
        return ""
    }

    if (typeof value === "string") {
        return value.trim()
    }

    try {
        return JSON.stringify(value)
    } catch (_) {
        return String(value).trim()
    }
}

function composeReportTitle({ jobTitle, company, aiTitle, jobDescription }) {
    const cleanJobTitle = normalizeText(jobTitle)
    const cleanCompany = normalizeText(company)
    const cleanAiTitle = normalizeText(aiTitle)
    const firstLine = normalizeText(jobDescription).split("\n")[0].replace(/^as\s+/i, "").slice(0, 80)

    if (cleanJobTitle && cleanCompany) {
        return `${cleanJobTitle} at ${cleanCompany}`
    }

    if (cleanJobTitle) {
        return cleanJobTitle
    }

    if (cleanAiTitle) {
        return cleanAiTitle
    }

    if (firstLine) {
        return firstLine
    }

    return "Interview Report"
}

async function extractResumeText(req) {
    const resumeFile = req.file || req.resumeFile

    if (!resumeFile) {
        return ""
    }

    if (!resumeFile.buffer) {
        throw createHttpError(400, "Resume file buffer is missing")
    }

    if (resumeFile.buffer.slice(0, 4).toString() !== "%PDF") {
        throw createHttpError(400, "Resume must be a valid PDF file")
    }

    const parser = new PDFParse({ data: resumeFile.buffer })

    try {
        const parsed = await parser.getText()
        return normalizeText(parsed?.text)
    } finally {
        await parser.destroy()
    }
}

function validateObjectId(id, label = "resource id") {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createHttpError(400, `Invalid ${label}`)
    }
}

/**
 * @name generateInterViewReportController
 * @description generate interview report from resume, self description and job description
 * @access private
 */
async function generateInterViewReportController(req, res) {
    const selfDescription = normalizeText(req.body?.selfDescription)
    const jobDescription = normalizeText(req.body?.jobDescription)
    const jobTitle = normalizeText(req.body?.jobTitle)
    const company = normalizeText(req.body?.company)

    if (!jobDescription) {
        throw createHttpError(400, "Job description is required")
    }

    const resume = await extractResumeText(req)

    const aiReport = await generateInterviewReport({
        resume,
        selfDescription,
        jobDescription
    })

    const interviewReport = await interviewReportModel.create({
        jobDescription,
        jobTitle,
        company,
        resume,
        selfDescription,
        matchScore: aiReport.matchScore,
        technicalQuestions: aiReport.technicalQuestions,
        behavioralQuestions: aiReport.behavioralQuestions,
        skillGaps: aiReport.skillGaps,
        preparationPlan: aiReport.preparationPlan,
        title: composeReportTitle({ jobTitle, company, aiTitle: aiReport.title, jobDescription }),
        user: req.user.id
    })

    return res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })
}

/**
 * @name getInterviewReportByIdController
 * @description get interview report by id for current user
 * @access private
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params
    validateObjectId(interviewId, "interview report id")

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id
    })

    if (!interviewReport) {
        throw createHttpError(404, "Interview report not found")
    }

    return res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}

/**
 * @name getAllInterviewReportsController
 * @description get all interview reports for current user
 * @access private
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 })

    return res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}

/**
 * @name generateResumePdfController
 * @description placeholder endpoint for resume PDF generation
 * @access private
 */
async function generateResumePdfController(req, res) {
    const reportId = req.params.interviewReportId || req.params.interviewId

    if (!reportId) {
        throw createHttpError(400, "Interview report id is required")
    }

    validateObjectId(reportId, "interview report id")

    const interviewReport = await interviewReportModel.findOne({
        _id: reportId,
        user: req.user.id
    })

    if (!interviewReport) {
        throw createHttpError(404, "Interview report not found")
    }

    const { resume, jobDescription, selfDescription } = interviewReport
    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${reportId}.pdf`
    })

    return res.send(pdfBuffer)
}


module.exports = {
    generateInterViewReportController,
    generateInterviewReportController: generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
}
