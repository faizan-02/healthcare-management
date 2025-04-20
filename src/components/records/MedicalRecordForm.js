"use client"

import { useState, useEffect } from "react"
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom"
import { getPatients, getDoctors, addMedicalRecord } from "../../services/api"

const MedicalRecordForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const preselectedPatientId = queryParams.get("patient")

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    doctor_id: "",
    visit_date: new Date().toISOString().split("T")[0], // Default to today
    diagnosis: "",
    treatment: "",
    notes: "",
  })

  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [patientsData, doctorsData] = await Promise.all([getPatients(), getDoctors()])

        setPatients(patientsData)
        setDoctors(doctorsData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load required data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await addMedicalRecord(formData)
      setSuccess(true)
      // Navigate after a short delay to show success message
      setTimeout(() => navigate("/records"), 1500)
    } catch (err) {
      console.error("Error adding medical record:", err)
      setError("Failed to add medical record. Please check your inputs and try again.")
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4">Add Medical Record</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && <Alert variant="success">Medical record added successfully!</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient</Form.Label>
                  <Form.Select name="patient_id" value={formData.patient_id} onChange={handleChange} required>
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Doctor</Form.Label>
                  <Form.Select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Visit Date</Form.Label>
              <Form.Control
                type="date"
                name="visit_date"
                value={formData.visit_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split("T")[0]} // Cannot be in the future
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                placeholder="Enter diagnosis details"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Treatment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                placeholder="Enter treatment details"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Add Record
              </Button>
              <Button variant="secondary" onClick={() => navigate("/records")}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default MedicalRecordForm
