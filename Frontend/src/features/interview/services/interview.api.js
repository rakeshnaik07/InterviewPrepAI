export const createReport = async (formData) => {
  return formData
}

export const getAll = async () => {
  return []
}

export const getById = async (id) => {
  return { id }
}

export const downloadResumePdf = async (id) => {
  return new Blob([id], { type: 'application/pdf' })
}
