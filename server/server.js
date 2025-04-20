const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const { pool, sql } = require("./db")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Wait for pool connection before starting server
pool
  .connect()
  .then(() => {
    console.log("Connected to database")
  })
  .catch((err) => {
    console.error("Failed to connect to database", err)
  })

// API Routes

// Get all patients
app.get("/api/patients", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM patients ORDER BY last_name, first_name")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching patients:", err)
    res.status(500).send("Server error")
  }
})

// Get patient by ID
app.get("/api/patients/:id", async (req, res) => {
  try {
    const result = await pool
      .request()
      .input("patient_id", sql.Int, req.params.id)
      .query("SELECT * FROM patients WHERE patient_id = @patient_id")

    if (result.recordset.length === 0) {
      return res.status(404).send("Patient not found")
    }

    res.json(result.recordset[0])
  } catch (err) {
    console.error("Error fetching patient:", err)
    res.status(500).send("Server error")
  }
})

// Add new patient
app.post("/api/patients", async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, contact_number, email, address, blood_type } = req.body

  try {
    const request = pool.request()

    // Create output parameter for patient_id
    request.output("patient_id", sql.Int)

    // Add input parameters
    request.input("first_name", sql.NVarChar(50), first_name)
    request.input("last_name", sql.NVarChar(50), last_name)
    request.input("date_of_birth", sql.Date, date_of_birth)
    request.input("gender", sql.NVarChar(10), gender)
    request.input("contact_number", sql.NVarChar(15), contact_number)
    request.input("email", sql.NVarChar(100), email)
    request.input("address", sql.NVarChar(sql.MAX), address)
    request.input("blood_type", sql.NVarChar(5), blood_type)

    // Execute the stored procedure
    await request.execute("add_patient")

    // Get the output parameter value
    const patientId = request.parameters.patient_id.value

    res.status(201).json({
      patient_id: patientId,
      message: "Patient added successfully",
    })
  } catch (err) {
    console.error("Error adding patient:", err)
    res.status(500).send("Server error")
  }
})

// Update patient
app.put("/api/patients/:id", async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, contact_number, email, address, blood_type } = req.body

  try {
    const result = await pool
      .request()
      .input("patient_id", sql.Int, req.params.id)
      .input("first_name", sql.NVarChar(50), first_name)
      .input("last_name", sql.NVarChar(50), last_name)
      .input("date_of_birth", sql.Date, date_of_birth)
      .input("gender", sql.NVarChar(10), gender)
      .input("contact_number", sql.NVarChar(15), contact_number)
      .input("email", sql.NVarChar(100), email)
      .input("address", sql.NVarChar(sql.MAX), address)
      .input("blood_type", sql.NVarChar(5), blood_type)
      .query(`
        UPDATE patients 
        SET first_name = @first_name, 
            last_name = @last_name, 
            date_of_birth = @date_of_birth, 
            gender = @gender, 
            contact_number = @contact_number, 
            email = @email, 
            address = @address, 
            blood_type = @blood_type 
        WHERE patient_id = @patient_id
      `)

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Patient not found")
    }

    res.json({ message: "Patient updated successfully" })
  } catch (err) {
    console.error("Error updating patient:", err)
    res.status(500).send("Server error")
  }
})

// Delete patient
app.delete("/api/patients/:id", async (req, res) => {
  try {
    // First check if patient has appointments or medical records
    const checkResult = await pool
      .request()
      .input("patient_id", sql.Int, req.params.id)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM appointments WHERE patient_id = @patient_id) as appointment_count,
          (SELECT COUNT(*) FROM medical_records WHERE patient_id = @patient_id) as record_count
      `)

    const { appointment_count, record_count } = checkResult.recordset[0]

    if (appointment_count > 0 || record_count > 0) {
      return res.status(400).json({
        message: "Cannot delete patient with existing appointments or medical records",
        appointment_count,
        record_count,
      })
    }

    // If no related records, proceed with deletion
    const result = await pool
      .request()
      .input("patient_id", sql.Int, req.params.id)
      .query("DELETE FROM patients WHERE patient_id = @patient_id")

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Patient not found")
    }

    res.json({ message: "Patient deleted successfully" })
  } catch (err) {
    console.error("Error deleting patient:", err)
    res.status(500).send("Server error")
  }
})

// Get all doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const result = await pool.request().query("SELECT * FROM doctors ORDER BY last_name, first_name")
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching doctors:", err)
    res.status(500).send("Server error")
  }
})

// Get appointments
app.get("/api/appointments", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT a.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as doctor_first_name, d.last_name as doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN doctors d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching appointments:", err)
    res.status(500).send("Server error")
  }
})

// Schedule appointment
app.post("/api/appointments", async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body

  try {
    await pool
      .request()
      .input("patient_id", sql.Int, patient_id)
      .input("doctor_id", sql.Int, doctor_id)
      .input("appointment_date", sql.Date, appointment_date)
      .input("appointment_time", sql.Time, appointment_time)
      .input("reason", sql.NVarChar(sql.MAX), reason)
      .execute("schedule_appointment")

    res.status(201).json({ message: "Appointment scheduled successfully" })
  } catch (err) {
    console.error("Error scheduling appointment:", err)
    res.status(500).send("Server error: " + err.message)
  }
})

// Get medical records
app.get("/api/medical-records", async (req, res) => {
  try {
    const result = await pool.request().query(`
      SELECT mr.*, 
             p.first_name as patient_first_name, p.last_name as patient_last_name,
             d.first_name as doctor_first_name, d.last_name as doctor_last_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.patient_id
      JOIN doctors d ON mr.doctor_id = d.doctor_id
      ORDER BY mr.visit_date DESC
    `)
    res.json(result.recordset)
  } catch (err) {
    console.error("Error fetching medical records:", err)
    res.status(500).send("Server error")
  }
})

// Add medical record
app.post("/api/medical-records", async (req, res) => {
  const { patient_id, doctor_id, visit_date, diagnosis, treatment, notes } = req.body

  try {
    const result = await pool
      .request()
      .input("patient_id", sql.Int, patient_id)
      .input("doctor_id", sql.Int, doctor_id)
      .input("visit_date", sql.Date, visit_date)
      .input("diagnosis", sql.NVarChar(sql.MAX), diagnosis)
      .input("treatment", sql.NVarChar(sql.MAX), treatment)
      .input("notes", sql.NVarChar(sql.MAX), notes)
      .query(`
        INSERT INTO medical_records (patient_id, doctor_id, visit_date, diagnosis, treatment, notes)
        VALUES (@patient_id, @doctor_id, @visit_date, @diagnosis, @treatment, @notes);
        SELECT SCOPE_IDENTITY() AS record_id;
      `)

    res.status(201).json({
      record_id: result.recordset[0].record_id,
      message: "Medical record added successfully",
    })
  } catch (err) {
    console.error("Error adding medical record:", err)
    res.status(500).send("Server error")
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
