"use client"

import { useState, useEffect } from "react"
import { Row, Col, Card, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { getPatients, getDoctors, getAppointments, getMedicalRecords } from "../services/api"

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    medicalRecords: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [patients, doctors, appointments, medicalRecords] = await Promise.all([
          getPatients(),
          getDoctors(),
          getAppointments(),
          getMedicalRecords(),
        ])

        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          medicalRecords: medicalRecords.length,
        })
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

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
      <h1 className="mb-4">Dashboard</h1>

      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="dashboard-icon text-primary">
                <i className="bi bi-people-fill"></i>
              </div>
              <Card.Title>Patients</Card.Title>
              <Card.Text className="display-4">{stats.patients}</Card.Text>
              <Button as={Link} to="/patients" variant="outline-primary">
                View All
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="dashboard-icon text-success">
                <i className="bi bi-hospital-fill"></i>
              </div>
              <Card.Title>Doctors</Card.Title>
              <Card.Text className="display-4">{stats.doctors}</Card.Text>
              <Button as={Link} to="/doctors" variant="outline-success">
                View All
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="dashboard-icon text-warning">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <Card.Title>Appointments</Card.Title>
              <Card.Text className="display-4">{stats.appointments}</Card.Text>
              <Button as={Link} to="/appointments" variant="outline-warning">
                View All
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card className="dashboard-card text-center">
            <Card.Body>
              <div className="dashboard-icon text-info">
                <i className="bi bi-file-medical-fill"></i>
              </div>
              <Card.Title>Medical Records</Card.Title>
              <Card.Text className="display-4">{stats.medicalRecords}</Card.Text>
              <Button as={Link} to="/records" variant="outline-info">
                View All
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button as={Link} to="/patients/add" variant="primary">
                  Add New Patient
                </Button>
                <Button as={Link} to="/appointments/add" variant="success">
                  Schedule Appointment
                </Button>
                <Button as={Link} to="/records/add" variant="info">
                  Add Medical Record
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header as="h5">System Information</Card.Header>
            <Card.Body>
              <Card.Text>
                <strong>Healthcare Management System</strong>
                <br />
                Version 1.0.0
                <br />
                Database: Microsoft SQL Server
                <br />
                Last Updated: {new Date().toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
