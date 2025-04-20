"use client"

import { useState, useEffect } from "react"
import { Table, Card, Form, InputGroup, Button, Badge } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getAppointments } from "../../services/api"

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const data = await getAppointments()
        setAppointments(data)
        setFilteredAppointments(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Failed to load appointments. Please try again later.")
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  useEffect(() => {
    let filtered = appointments

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    // Apply search term
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.patient_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.doctor_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.doctor_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredAppointments(filtered)
  }, [searchTerm, statusFilter, appointments])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options)
  }

  const getStatusBadge = (status) => {
    let variant
    switch (status) {
      case "Scheduled":
        variant = "primary"
        break
      case "Completed":
        variant = "success"
        break
      case "Cancelled":
        variant = "danger"
        break
      default:
        variant = "secondary"
    }

    return <Badge bg={variant}>{status}</Badge>
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
        <h1>Appointments</h1>
        <Button as={Link} to="/appointments/add" variant="primary">
          Schedule New Appointment
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-column flex-md-row gap-3 mb-3">
            <InputGroup>
              <Form.Control
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            </InputGroup>

            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ maxWidth: "200px" }}
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </div>

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td>{appointment.appointment_id}</td>
                      <td>{`${appointment.patient_first_name} ${appointment.patient_last_name}`}</td>
                      <td>{`${appointment.doctor_first_name} ${appointment.doctor_last_name}`}</td>
                      <td>
                        {formatDate(appointment.appointment_date)}
                        <br />
                        <small>{formatTime(appointment.appointment_time)}</small>
                      </td>
                      <td>{appointment.reason || "N/A"}</td>
                      <td>{getStatusBadge(appointment.status)}</td>
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

export default AppointmentsList
