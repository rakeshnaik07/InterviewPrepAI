const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "GOOGLE_GENAI_API_KEY"
]

function validateEnv() {
    const required = process.env.NODE_ENV === 'production'
        ? [...requiredEnvVars, 'FRONTEND_ORIGIN', 'NODE_ENV']
        : requiredEnvVars
    const missing = [...new Set(required)].filter((key) => !process.env[key])

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
}

function getFrontendOrigins() {
    const configuredOrigins = process.env.FRONTEND_ORIGIN || "http://localhost:5173"

    return configuredOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
}

module.exports = {
    validateEnv,
    getFrontendOrigins
}
