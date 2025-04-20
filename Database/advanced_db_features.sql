CREATE DATABASE healthcare_management;

USE master;

-- Close all connections to healthcare_management
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'healthcare_management')
BEGIN
    ALTER DATABASE healthcare_management SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE healthcare_management;
END

-- Create fresh database
CREATE DATABASE healthcare_management;

-- Create tables without foreign keys first
CREATE TABLE patients (
    patient_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender NVARCHAR(10) NOT NULL,
    contact_number NVARCHAR(15) NULL,
    email NVARCHAR(100) NULL,
    address NVARCHAR(MAX) NULL,
    blood_type NVARCHAR(5) NULL,
    registration_date DATETIME DEFAULT GETDATE()
);

CREATE TABLE doctors (
    doctor_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    specialization NVARCHAR(100) NOT NULL,
    experience INT,
    contact_number NVARCHAR(15),
    email NVARCHAR(100),
    status NVARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE activity_log (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    action_type NVARCHAR(50) NOT NULL,
    entity_type NVARCHAR(50) NOT NULL,
    entity_id INT,
    action_details NVARCHAR(MAX),
    action_date DATETIME DEFAULT GETDATE(),
    user_info NVARCHAR(100)
);

CREATE TABLE patient_history (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL,
    action_type NVARCHAR(10) NOT NULL,
    action_date DATETIME DEFAULT GETDATE(),
    modified_by NVARCHAR(100),
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX)
);

USE healthcare_management;

-- Tables with foreign keys
CREATE TABLE appointments (
    appointment_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason NVARCHAR(MAX),
    status NVARCHAR(20) DEFAULT 'Scheduled',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

CREATE TABLE medical_records (
    record_id INT IDENTITY(1,1) PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    visit_date DATE NOT NULL,
    diagnosis NVARCHAR(MAX),
    treatment NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);


INSERT INTO doctors (first_name, last_name, specialization, experience, contact_number, email, status)
VALUES 
('John', 'Smith', 'Cardiology', 10, '555-0100', 'john.smith@hospital.com', 'Active'),
('Emily', 'Johnson', 'Neurology', 8, '555-0101', 'emily.johnson@hospital.com', 'Active'),
('Michael', 'Williams', 'Pediatrics', 12, '555-0102', 'michael.williams@hospital.com', 'Active'),
('Jessica', 'Brown', 'Orthopedics', 15, '555-0103', 'jessica.brown@hospital.com', 'Active'),
('David', 'Jones', 'Dermatology', 7, '555-0104', 'david.jones@hospital.com', 'Active');


-- Calculate patient age function
CREATE FUNCTION calculate_patient_age (@patient_id INT)
RETURNS INT
AS
BEGIN
    DECLARE @age INT = 0;
    DECLARE @dob DATE;
    
    SELECT @dob = date_of_birth 
    FROM patients 
    WHERE patient_id = @patient_id;
    
    IF @dob IS NOT NULL
        SET @age = DATEDIFF(YEAR, @dob, GETDATE());
    
    RETURN @age;
END;

-- Get doctor appointment count function
CREATE FUNCTION get_doctor_appointment_count 
(
    @doctor_id INT,
    @start_date DATE,
    @end_date DATE
)
RETURNS INT
AS
BEGIN
    DECLARE @count INT = 0;
    
    SELECT @count = COUNT(*)
    FROM appointments
    WHERE doctor_id = @doctor_id
    AND appointment_date BETWEEN @start_date AND @end_date;
    
    RETURN ISNULL(@count, 0);
END;


-- Check doctor availability function
CREATE FUNCTION is_doctor_available 
(
    @doctor_id INT,
    @appointment_date DATE,
    @appointment_time TIME
)
RETURNS BIT
AS
BEGIN
    DECLARE @is_available BIT = 1;
    
    IF EXISTS (
        SELECT 1
        FROM appointments
        WHERE doctor_id = @doctor_id
        AND appointment_date = @appointment_date
        AND appointment_time = @appointment_time
    )
        SET @is_available = 0;
    
    RETURN @is_available;
END;

--PROCEDURES
-- Add patient procedure with simpler transaction handling
CREATE PROCEDURE add_patient
    @first_name NVARCHAR(50),
    @last_name NVARCHAR(50),
    @date_of_birth DATE,
    @gender NVARCHAR(10),
    @contact_number NVARCHAR(15) = NULL,
    @email NVARCHAR(100) = NULL,
    @address NVARCHAR(MAX) = NULL,
    @blood_type NVARCHAR(5) = NULL,
    @patient_id INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate required parameters
    IF @first_name IS NULL OR @last_name IS NULL OR @date_of_birth IS NULL OR @gender IS NULL
    BEGIN
        RAISERROR('Required parameters cannot be null', 16, 1);
        RETURN;
    END
    
    -- Validate date of birth
    IF @date_of_birth > GETDATE()
    BEGIN
        RAISERROR('Date of birth cannot be in the future', 16, 1);
        RETURN;
    END
    
    BEGIN TRY
        -- Insert the patient
        INSERT INTO patients (first_name, last_name, date_of_birth, gender, contact_number, email, address, blood_type)
        VALUES (@first_name, @last_name, @date_of_birth, @gender, @contact_number, @email, @address, @blood_type);
        
        SET @patient_id = SCOPE_IDENTITY();
        
        -- Log the activity
        INSERT INTO activity_log (action_type, entity_type, entity_id, action_details, user_info)
        VALUES ('INSERT', 'PATIENT', @patient_id, 'New patient registered', SYSTEM_USER);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;

-- Schedule appointment procedure
CREATE PROCEDURE schedule_appointment
    @patient_id INT,
    @doctor_id INT,
    @appointment_date DATE,
    @appointment_time TIME,
    @reason NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate parameters & check availability
    IF @patient_id IS NULL OR @doctor_id IS NULL OR @appointment_date IS NULL OR @appointment_time IS NULL
    BEGIN
        RAISERROR('Required parameters cannot be null', 16, 1);
        RETURN;
    END
    
    -- Check if doctor is available
    DECLARE @is_available BIT;
    SET @is_available = dbo.is_doctor_available(@doctor_id, @appointment_date, @appointment_time);
    
    IF @is_available = 0
    BEGIN
        RAISERROR('Doctor is not available at this time', 16, 1);
        RETURN;
    END
    
    BEGIN TRY
        -- Insert appointment
        INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason)
        VALUES (@patient_id, @doctor_id, @appointment_date, @appointment_time, @reason);
        
        DECLARE @appointment_id INT = SCOPE_IDENTITY();
        
        -- Log activity
        INSERT INTO activity_log (action_type, entity_type, entity_id, action_details, user_info)
        VALUES ('CREATE', 'APPOINTMENT', @appointment_id, 'New appointment scheduled', SYSTEM_USER);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;

-- Create patient audit trigger
CREATE TRIGGER trg_patient_audit
ON patients
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @action_type NVARCHAR(10);
    
    IF EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted)
        SET @action_type = 'UPDATE';
    ELSE IF EXISTS (SELECT 1 FROM inserted)
        SET @action_type = 'INSERT';
    ELSE
        SET @action_type = 'DELETE';
    
    IF @action_type = 'INSERT'
    BEGIN
        INSERT INTO patient_history (patient_id, action_type, modified_by)
        SELECT patient_id, @action_type, SYSTEM_USER
        FROM inserted;
    END
    
    IF @action_type = 'UPDATE'
    BEGIN
        INSERT INTO patient_history (patient_id, action_type, modified_by)
        SELECT patient_id, @action_type, SYSTEM_USER
        FROM inserted;
    END
    
    IF @action_type = 'DELETE'
    BEGIN
        INSERT INTO patient_history (patient_id, action_type, modified_by)
        SELECT patient_id, @action_type, SYSTEM_USER
        FROM deleted;
    END
END;


-- Add a test patient
DECLARE @patient_id INT;
EXEC add_patient 
    @first_name = 'Jane',
    @last_name = 'Doe',
    @date_of_birth = '1990-05-15',
    @gender = 'F',
    @contact_number = '555-0123',
    @patient_id = @patient_id OUTPUT;

PRINT 'Added patient ID: ' + CAST(@patient_id AS VARCHAR(10));


-- Schedule an appointment
DECLARE @future_date DATE = DATEADD(DAY, 7, GETDATE());
EXEC schedule_appointment
    @patient_id = 1,
    @doctor_id = 1,
    @appointment_date = @future_date,
    @appointment_time = '10:00',
    @reason = 'Annual checkup';

-- Verify data
SELECT * FROM patients;
SELECT * FROM appointments;
SELECT * FROM patient_history;
SELECT * FROM activity_log;




