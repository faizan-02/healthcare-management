import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

// Components
import Navigation from "./components/Navigation"
import Dashboard from "./components/Dashboard"
import PatientsList from "./components/patients/PatientsList"
import PatientForm from "./components/patients/PatientForm"
import PatientDetails from "./components/patients/PatientDetails"
import DoctorsList from "./components/doctors/DoctorsList"
import AppointmentsList from "./components/appointments/AppointmentsList"
import AppointmentForm from "./components/appointments/AppointmentForm"
import MedicalRecordsList from "./components/records/MedicalRecordsList"
import MedicalRecordForm from "./components/records/MedicalRecordForm"

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Patient Routes */}
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/add" element={<PatientForm />} />
            <Route path="/patients/edit/:id" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientDetails />} />

            {/* Doctor Routes */}
            <Route path="/doctors" element={<DoctorsList />} />

            {/* Appointment Routes */}
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/appointments/add" element={<AppointmentForm />} />

            {/* Medical Record Routes */}
            <Route path="/records" element={<MedicalRecordsList />} />
            <Route path="/records/add" element={<MedicalRecordForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
