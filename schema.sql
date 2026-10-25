-- =====================================================================
-- Al-Millah Class Management System — Relational Database Schema
-- Target Engine: PostgreSQL 14+ (Standard SQL compatible)
-- Description: Schema supporting students, Qur'an memorization logs,
--              daily attendance, daily activities & adab ratings,
--              announcements, and weekly performance reports.
-- =====================================================================

-- Enable UUID extension if using UUID primary keys (optional, standard UUIDv4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- ---------------------------------------------------------------------
CREATE TYPE attendance_status_type AS ENUM (
    'present',
    'absent',
    'late',
    'sick'
);

CREATE TYPE announcement_priority_type AS ENUM (
    'normal',
    'urgent',
    'exam',
    'event'
);

-- ---------------------------------------------------------------------
-- 2. TABLE: students
-- Represents students enrolled in the madrasah/class.
-- ---------------------------------------------------------------------
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    arabic_name VARCHAR(150),
    class_name VARCHAR(50) NOT NULL DEFAULT 'Class Five',
    parent_name VARCHAR(150) NOT NULL,
    parent_phone_number VARCHAR(30) NOT NULL,
    parent_email VARCHAR(100),
    address TEXT,
    student_photo_url VARCHAR(500),
    date_of_birth DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_students_roll_class UNIQUE (class_name, roll_number)
);

CREATE INDEX idx_students_class ON students(class_name);
CREATE INDEX idx_students_parent_phone ON students(parent_phone_number);

-- ---------------------------------------------------------------------
-- 3. TABLE: memorization_records
-- Detailed Qur'an recitation and Hifz evaluation entries.
-- ---------------------------------------------------------------------
CREATE TABLE memorization_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    surah_name VARCHAR(100) NOT NULL,
    surah_number INT CHECK (surah_number BETWEEN 1 AND 114),
    ayah_range VARCHAR(50) NOT NULL, -- e.g. '1-25' or '15-40'
    ayah_start INT NOT NULL CHECK (ayah_start > 0),
    ayah_end INT NOT NULL CHECK (ayah_end >= ayah_start),
    is_new_memorization BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE: Sabaq (New), FALSE: Revision (Sabqi/Manzil)
    mistakes INT NOT NULL DEFAULT 0 CHECK (mistakes >= 0),
    corrected_mistakes INT NOT NULL DEFAULT 0 CHECK (corrected_mistakes >= 0),
    uncorrected_mistakes INT NOT NULL DEFAULT 0 CHECK (uncorrected_mistakes >= 0),
    tajweed_rating VARCHAR(30) DEFAULT 'Jayyid Jiddan', -- e.g. Mumtaz, Jayyid Jiddan, Jayyid, Maqbool
    status VARCHAR(20) NOT NULL DEFAULT 'passed' CHECK (status IN ('passed', 'repeat', 'pending')),
    teacher_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_mistakes_balance CHECK (uncorrected_mistakes <= mistakes)
);

CREATE INDEX idx_memorization_student_date ON memorization_records(student_id, record_date DESC);
CREATE INDEX idx_memorization_surah ON memorization_records(surah_name);

-- ---------------------------------------------------------------------
-- 4. TABLE: attendance
-- Daily attendance register tracking presence, tardiness, illness, etc.
-- ---------------------------------------------------------------------
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_name VARCHAR(50) NOT NULL DEFAULT 'morning', -- 'morning', 'dhuhr', 'afternoon'
    status attendance_status_type NOT NULL DEFAULT 'present',
    arrival_time TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_date_session UNIQUE (student_id, attendance_date, session_name)
);

CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_student ON attendance(student_id);

-- ---------------------------------------------------------------------
-- 5. TABLE: daily_activities
-- Daily behavioural adab, homework completion, and activity metrics.
-- All percentage fields enforced between 0.00% and 100.00%.
-- ---------------------------------------------------------------------
CREATE TABLE daily_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quran_memorization_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (quran_memorization_percentage BETWEEN 0.00 AND 100.00),
    homework_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (homework_percentage BETWEEN 0.00 AND 100.00),
    class_participation_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (class_participation_percentage BETWEEN 0.00 AND 100.00),
    neatness_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (neatness_percentage BETWEEN 0.00 AND 100.00),
    respect_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (respect_percentage BETWEEN 0.00 AND 100.00),
    self_control_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00 
        CHECK (self_control_percentage BETWEEN 0.00 AND 100.00),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_activity_date UNIQUE (student_id, activity_date)
);

CREATE INDEX idx_activities_student_date ON daily_activities(student_id, activity_date DESC);

-- ---------------------------------------------------------------------
-- 6. TABLE: announcements
-- Broadcast notices, reminders, and notifications for parents.
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    announcement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_class VARCHAR(50) DEFAULT 'Class Five',
    target_audience VARCHAR(50) NOT NULL DEFAULT 'all_parents', -- 'all_parents', 'specific_parents'
    priority announcement_priority_type NOT NULL DEFAULT 'normal',
    author_name VARCHAR(100) DEFAULT 'Ustadh Ibrahim',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_date ON announcements(announcement_date DESC);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);

-- Optional: Junction table for announcements targeted to specific parents/students
CREATE TABLE announcement_parents (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (announcement_id, student_id)
);

-- ---------------------------------------------------------------------
-- 7. TABLE: weekly_reports
-- Weekly aggregated performance cards containing percentages & remarks.
-- ---------------------------------------------------------------------
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    attendance_percentage NUMERIC(5,2) NOT NULL 
        CHECK (attendance_percentage BETWEEN 0.00 AND 100.00),
    memorization_percentage NUMERIC(5,2) NOT NULL 
        CHECK (memorization_percentage BETWEEN 0.00 AND 100.00),
    activity_percentage NUMERIC(5,2) NOT NULL 
        CHECK (activity_percentage BETWEEN 0.00 AND 100.00),
    overall_percentage NUMERIC(5,2) NOT NULL 
        CHECK (overall_percentage BETWEEN 0.00 AND 100.00),
    grade_letter VARCHAR(5), -- e.g. 'A+', 'Mumtaz', 'Jayyid'
    teacher_comment TEXT,
    parent_signature_status VARCHAR(30) DEFAULT 'pending' 
        CHECK (parent_signature_status IN ('pending', 'acknowledged', 'signed')),
    parent_signature_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_week UNIQUE (student_id, week_start_date),
    CONSTRAINT chk_week_dates CHECK (week_end_date >= week_start_date)
);

CREATE INDEX idx_weekly_reports_student ON weekly_reports(student_id, week_start_date DESC);
CREATE INDEX idx_weekly_reports_date ON weekly_reports(week_start_date, week_end_date);

-- ---------------------------------------------------------------------
-- 8. HELPER VIEW: student_weekly_aggregation_view
-- Automatically calculates metrics from daily records for reporting
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW student_weekly_aggregation_view AS
SELECT 
    s.id AS student_id,
    s.roll_number,
    s.full_name,
    s.class_name,
    COUNT(DISTINCT a.id) AS total_attendance_sessions,
    ROUND(
        (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::NUMERIC / 
         NULLIF(COUNT(a.id), 0)) * 100, 
        2
    ) AS calculated_attendance_pct,
    ROUND(AVG(da.quran_memorization_percentage), 2) AS avg_memorization_pct,
    ROUND(
        AVG(
            (da.homework_percentage + 
             da.class_participation_percentage + 
             da.neatness_percentage + 
             da.respect_percentage + 
             da.self_control_percentage) / 5.0
        ), 
        2
    ) AS avg_activity_pct
FROM students s
LEFT JOIN attendance a ON s.id = a.student_id
LEFT JOIN daily_activities da ON s.id = da.student_id
GROUP BY s.id, s.roll_number, s.full_name, s.class_name;
