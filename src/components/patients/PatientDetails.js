"use client"

import { useState, useEffect } from "react"
import { Card, Row, Col, Button, Table } from "react-bootstrap"
import { Link, useParams, useNavigate } from "react-router-dom"
import { getPatientById } from "../../services/api"

const PatientDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await getPatientById(id)
        setPatient(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching patient details:", err)
        setError("Failed to load patient details. Please try again later.")
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id])

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    return age
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
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

  if (error) {
    return (
      <div className="alert alert-danger mt-3" role="alert">
        {error}
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="alert alert-warning mt-3" role="alert">
        Patient not found.
      </div>
    )
  }

  return (
    <div>
      <div className="patient-details-header">
        <h1>Patient Details</h1>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/patients/edit/${patient.patient_id}`} variant="warning">
            Edit
          </Button>
          <Button as={Link} to="/patients" variant="secondary">
            Back to List
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="patient-details-card">
            <Card.Header>
              <h3>
                {patient.first_name} {patient.last_name}
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Patient ID:</strong> {patient.patient_id}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {formatDate(patient.date_of_birth)}
                  </p>
                  <p>
                    <strong>Age:</strong> {calculateAge(patient.date_of_birth)} years
                  </p>
                  <p>
                    <strong>Gender:</strong>{" "}
                    {patient.gender === "M" ? "Male" : patient.gender === "F" ? "Female" : patient.gender}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Blood Type:</strong> {patient.blood_type || "Unknown"}
                  </p>
                  <p>
                    <strong>Contact:</strong> {patient.contact_number || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {patient.email || "N/A"}
                  </p>
                  <p>
                    <strong>Registration Date:</strong> {formatDate(patient.registration_date)}
                  </p>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col>
                  <p>
                    <strong>Address:</strong>
                  </p>
                  <p>{patient.address || "No address provided"}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Medical Records</h4>
              <Button as={Link} to={`/records/add?patient=${patient.patient_id}`} variant="primary" size="sm">
                Add Record
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Diagnosis</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="text-center">
                        No medical records found
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Upcoming Appointments</h4>
              <Button as={Link} to={`/appointments/add?patient=${patient.patient_id}`} variant="primary" size="sm">
                Schedule
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="3" className="text-center">
                        No upcoming appointments
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4>Quick Actions</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to={`/appointments/add?patient=${patient.patient_id}`} variant="success">
                  Schedule Appointment
                </Button>
                <Button as={Link} to={`/records/add?patient=${patient.patient_id}`} variant="info">
                  Add Medical Record
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PatientDetails
