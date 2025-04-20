"use client"

import { useState, useEffect } from "react"
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap"
import { useNavigate, useParams } from "react-router-dom"
import { getPatientById, addPatient, updatePatient } from "../../services/api"

const PatientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    contact_number: "",
    email: "",
    address: "",
    blood_type: "",
  })

  const [loading, setLoading] = useState(isEditMode)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isEditMode) {
      const fetchPatient = async () => {
        try {
          const data = await getPatientById(id)
          // Format date for the date input
          const formattedDate = data.date_of_birth ? new Date(data.date_of_birth).toISOString().split("T")[0] : ""

          setFormData({
            ...data,
            date_of_birth: formattedDate,
          })
          setLoading(false)
        } catch (err) {
          console.error("Error fetching patient:", err)
          setError("Failed to load patient data. Please try again later.")
          setLoading(false)
        }
      }

      fetchPatient()
    }
  }, [id, isEditMode])

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
      if (isEditMode) {
        await updatePatient(id, formData)
        setSuccess(true)
        // Navigate after a short delay to show success message
        setTimeout(() => navigate(`/patients/${id}`), 1500)
      } else {
        const result = await addPatient(formData)
        setSuccess(true)
        // Navigate after a short delay to show success message
        setTimeout(() => navigate(`/patients/${result.patient_id}`), 1500)
      }
    } catch (err) {
      console.error("Error saving patient:", err)
      setError("Failed to save patient data. Please check your inputs and try again.")
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
      <h1 className="mb-4">{isEditMode ? "Edit Patient" : "Add New Patient"}</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && <Alert variant="success">Patient {isEditMode ? "updated" : "added"} successfully!</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact_number"
                    value={formData.contact_number || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Blood Type</Form.Label>
              <Form.Select name="blood_type" value={formData.blood_type || ""} onChange={handleChange}>
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                {isEditMode ? "Update Patient" : "Add Patient"}
              </Button>
              <Button variant="secondary" onClick={() => navigate("/patients")}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default PatientForm
