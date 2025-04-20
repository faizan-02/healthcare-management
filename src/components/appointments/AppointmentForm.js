"use client"

import { useState, useEffect } from "react"
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useLocation } from "react-router-dom"
import { getPatients, getDoctors, addAppointment } from "../../services/api"

const AppointmentForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const preselectedPatientId = queryParams.get("patient")

  const [formData, setFormData] = useState({
    patient_id: preselectedPatientId || "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
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
      await addAppointment(formData)
      setSuccess(true)
      // Navigate after a short delay to show success message
      setTimeout(() => navigate("/appointments"), 1500)
    } catch (err) {
      console.error("Error scheduling appointment:", err)
      setError("Failed to schedule appointment. " + (err.response?.data || "Please check your inputs and try again."))
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
      <h1 className="mb-4">Schedule New Appointment</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && <Alert variant="success">Appointment scheduled successfully!</Alert>}

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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Appointment Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Describe the reason for the appointment"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Schedule Appointment
              </Button>
              <Button variant="secondary" onClick={() => navigate("/appointments")}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AppointmentForm
