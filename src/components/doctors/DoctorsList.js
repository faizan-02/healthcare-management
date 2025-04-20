"use client"

import { useState, useEffect } from "react"
import { Table, Card, Form, InputGroup, Button } from "react-bootstrap"
import { getDoctors } from "../../services/api"

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const data = await getDoctors()
        setDoctors(data)
        setFilteredDoctors(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Failed to load doctors. Please try again later.")
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDoctors(doctors)
    } else {
      const filtered = doctors.filter(
        (doctor) =>
          doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredDoctors(filtered)
    }
  }, [searchTerm, doctors])

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
      <h1 className="mb-4">Doctors</h1>

      <Card className="mb-4">
        <Card.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Search by name, specialization, or email..."
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
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.doctor_id}>
                      <td>{doctor.doctor_id}</td>
                      <td>{`${doctor.first_name} ${doctor.last_name}`}</td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.experience} years</td>
                      <td>{doctor.contact_number || "N/A"}</td>
                      <td>
                        <span className={`badge ${doctor.status === "Active" ? "bg-success" : "bg-secondary"}`}>
                          {doctor.status}
                        </span>
                      </td>
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

export default DoctorsList
