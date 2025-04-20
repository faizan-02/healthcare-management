import axios from "axios"

const API_URL = "/api"

// Patient API calls
export const getPatients = async () => {
  try {
    const response = await axios.get(`${API_URL}/patients`)
    return response.data
  } catch (error) {
    console.error("Error fetching patients:", error)
    throw error
  }
}

export const getPatientById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching patient ${id}:`, error)
    throw error
  }
}

export const addPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_URL}/patients`, patientData)
    return response.data
  } catch (error) {
    console.error("Error adding patient:", error)
    throw error
  }
}

export const updatePatient = async (id, patientData) => {
  try {
    const response = await axios.put(`${API_URL}/patients/${id}`, patientData)
    return response.data
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error)
    throw error
  }
}

export const deletePatient = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/patients/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting patient ${id}:`, error)
    throw error
  }
}

// Doctor API calls
export const getDoctors = async () => {
  try {
    const response = await axios.get(`${API_URL}/doctors`)
    return response.data
  } catch (error) {
    console.error("Error fetching doctors:", error)
    throw error
  }
}

// Appointment API calls
export const getAppointments = async () => {
  try {
    const response = await axios.get(`${API_URL}/appointments`)
    return response.data
  } catch (error) {
    console.error("Error fetching appointments:", error)
    throw error
  }
}

export const addAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData)
    return response.data
  } catch (error) {
    console.error("Error adding appointment:", error)
    throw error
  }
}

// Medical Record API calls
export const getMedicalRecords = async () => {
  try {
    const response = await axios.get(`${API_URL}/medical-records`)
    return response.data
  } catch (error) {
    console.error("Error fetching medical records:", error)
    throw error
  }
}

export const addMedicalRecord = async (recordData) => {
  try {
    const response = await axios.post(`${API_URL}/medical-records`, recordData)
    return response.data
  } catch (error) {
    console.error("Error adding medical record:", error)
    throw error
  }
}
