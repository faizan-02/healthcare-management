"use client"

import { useState, useEffect } from "react"
import { Table, Button, Card, Form, InputGroup } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getPatients, deletePatient } from "../../services/api"

const PatientsList = () => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.contact_number?.includes(searchTerm) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await getPatients()
      setPatients(data)
      setFilteredPatients(data)
      setLoading(false)
    } catch (err) {
      console.error("Error in PatientsList:", err)
      setError("Failed to load patients. Please try again later.")
      setLoading(false)
    }
  }

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!patientToDelete) return

    try {
      await deletePatient(patientToDelete.patient_id)
      setShowDeleteModal(false)
      setPatientToDelete(null)
      // Refresh the patients list
      fetchPatients()
    } catch (err) {
      console.error("Error deleting patient:", err)
      setError("Failed to delete patient. They may have appointments or medical records.")
    }
  }

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Patients</h1>
        <Button as={Link} to="/patients/add" variant="primary">
          Add New Patient
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
              Clear
            </Button>
          </InputGroup>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Contact</th>
                  <th>Blood Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td>{`${patient.first_name} ${patient.last_name}`}</td>
                      <td>{calculateAge(patient.date_of_birth)}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.contact_number || "N/A"}</td>
                      <td>{patient.blood_type || "Unknown"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button as={Link} to={`/patients/${patient.patient_id}`} variant="info" size="sm">
                            View
                          </Button>
                          <Button as={Link} to={`/patients/edit/${patient.patient_id}`} variant="warning" size="sm">
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(patient)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete {patientToDelete?.first_name} {patientToDelete?.last_name}?
                </p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <div className="modal-backdrop show"></div>}
    </div>
  )
}

export default PatientsList
