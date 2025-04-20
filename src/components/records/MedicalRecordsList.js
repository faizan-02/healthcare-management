"use client"

import { useState, useEffect } from "react"
import { Table, Card, Form, InputGroup, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getMedicalRecords } from "../../services/api"

const MedicalRecordsList = () => {
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        const data = await getMedicalRecords()
        setRecords(data)
        setFilteredRecords(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medical records:", err)
        setError("Failed to load medical records. Please try again later.")
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records)
    } else {
      const filtered = records.filter(
        (record) =>
          record.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patient_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.doctor_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.doctor_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRecords(filtered)
    }
  }, [searchTerm, records])

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Medical Records</h1>
        <Button as={Link} to="/records/add" variant="primary">
          Add New Record
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search records..."
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
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Visit Date</th>
                  <th>Diagnosis</th>
                  <th>Treatment</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No medical records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.record_id}>
                      <td>{record.record_id}</td>
                      <td>{`${record.patient_first_name} ${record.patient_last_name}`}</td>
                      <td>{`Dr. ${record.doctor_first_name} ${record.doctor_last_name}`}</td>
                      <td>{formatDate(record.visit_date)}</td>
                      <td>{record.diagnosis || "N/A"}</td>
                      <td>{record.treatment || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default MedicalRecordsList
