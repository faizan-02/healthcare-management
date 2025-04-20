import { Navbar, Nav, Container } from "react-bootstrap"
import { Link } from "react-router-dom"

const Navigation = () => {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Healthcare Management System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/patients">
              Patients
            </Nav.Link>
            <Nav.Link as={Link} to="/doctors">
              Doctors
            </Nav.Link>
            <Nav.Link as={Link} to="/appointments">
              Appointments
            </Nav.Link>
            <Nav.Link as={Link} to="/records">
              Medical Records
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Navigation
