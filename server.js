const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
=======
const dns = require('dns'); // ✅ 1. เพิ่มบรรทัดนี้เข้ามา

// ✅ 2. เพิ่มโค้ดบรรทัดนี้ เพื่อบังคับให้ใช้ IPv4 (ข้ามปัญหา ENETUNREACH IPv6)
dns.setDefaultResultOrder('ipv4first');
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

<<<<<<< HEAD
const DB_CONFIG = {
  user: 'SYSTEM',
  password: 'bigThogo_455',
  connectString: 'localhost:1521/xe',
};

// ── Connection Pool ──────────────────────────────────────────
async function initPool() {
  try {
    await oracledb.createPool({ ...DB_CONFIG, poolMin: 2, poolMax: 10 });
    console.log('✅ Oracle Database connected');
  } catch (err) {
    console.error('❌ Oracle connection failed:', err.message);
    process.exit(1);
  }
}

async function query(sql, binds = {}, opts = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    });
    return result;
=======
// ── วิธีเอา connection string จาก Supabase ───────────────────
// supabase.com → project → Settings → Database → Connection string → URI
// หน้าตาแบบนี้: postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
const pool = new Pool({
  // ✅ ต้องเป็นพอร์ต 6543 และใช้ลิงก์จากหน้า Transaction Pooler เท่านั้น
  connectionString: 'postgresql://postgres.pxtwpyqkvxtkmelzrraa:bigThogo_455@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } finally {
    client.release();
  }
}

// ── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
<<<<<<< HEAD
    await query('SELECT 1 FROM DUAL');
    res.json({ status: 'ok' });
=======
    await query('SELECT 1');
    res.json({ status: 'ok', message: 'Connected to Supabase PostgreSQL' });
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

<<<<<<< HEAD
// ── DASHBOARD STATS ──────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [empStats, deptCount, nightCount, attCount] = await Promise.all([
      query(`SELECT COUNT(*) AS TOTAL, SUM(CASE WHEN STATUS='Active' THEN 1 ELSE 0 END) AS ACTIVE FROM SYSTEM.EMPLOYEE`),
      query(`SELECT COUNT(*) AS CNT FROM SYSTEM.DEPARTMENT`),
      query(`SELECT COUNT(*) AS CNT FROM SYSTEM.ATTENDANCE WHERE IS_NIGHT = 1`),
      query(`SELECT COUNT(*) AS CNT FROM SYSTEM.ATTENDANCE`),
    ]);
    res.json({
      totalEmployees: empStats.rows[0].TOTAL,
      activeEmployees: empStats.rows[0].ACTIVE,
      departments: deptCount.rows[0].CNT,
      nightShiftRecords: nightCount.rows[0].CNT,
      attendanceRecords: attCount.rows[0].CNT,
=======
// ── STATS ────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const [emp, dept, night, att] = await Promise.all([
      query(`SELECT COUNT(*) AS total, SUM(CASE WHEN status='Active' THEN 1 ELSE 0 END) AS active FROM employee`),
      query(`SELECT COUNT(*) AS cnt FROM department`),
      query(`SELECT COUNT(*) AS cnt FROM attendance WHERE is_night = 1`),
      query(`SELECT COUNT(*) AS cnt FROM attendance`),
    ]);
    res.json({
      totalEmployees:   parseInt(emp[0].total),
      activeEmployees:  parseInt(emp[0].active),
      departments:      parseInt(dept[0].cnt),
      nightShiftRecords:parseInt(night[0].cnt),
      attendanceRecords:parseInt(att[0].cnt),
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DEPARTMENTS ───────────────────────────────────────────────
app.get('/api/departments', async (req, res) => {
  try {
<<<<<<< HEAD
    const result = await query(`
      SELECT d.DEPARTMENT_ID, d.DEPARTMENT_NAME, d.LOCATION, d.INTERNAL_PHONE,
             e.FIRST_NAME || ' ' || e.LAST_NAME AS MANAGER_NAME,
             COUNT(emp.EMPLOYEE_ID) AS EMPLOYEE_COUNT
      FROM SYSTEM.DEPARTMENT d
      LEFT JOIN SYSTEM.EMPLOYEE e   ON d.MANAGER_ID    = e.EMPLOYEE_ID
      LEFT JOIN SYSTEM.EMPLOYEE emp ON emp.DEPARTMENT_ID = d.DEPARTMENT_ID
      GROUP BY d.DEPARTMENT_ID, d.DEPARTMENT_NAME, d.LOCATION, d.INTERNAL_PHONE,
               e.FIRST_NAME, e.LAST_NAME
      ORDER BY d.DEPARTMENT_ID
    `);
    res.json(result.rows);
=======
    const rows = await query(`
      SELECT d.department_id, d.department_name, d.location, d.internal_phone,
             e.first_name || ' ' || e.last_name AS manager_name,
             COUNT(emp.employee_id) AS employee_count
      FROM department d
      LEFT JOIN employee e   ON d.manager_id    = e.employee_id
      LEFT JOIN employee emp ON emp.department_id = d.department_id
      GROUP BY d.department_id, d.department_name, d.location, d.internal_phone,
               e.first_name, e.last_name
      ORDER BY d.department_id
    `);
    res.json(rows.map(r => ({
      DEPARTMENT_ID:   r.department_id,
      DEPARTMENT_NAME: r.department_name,
      LOCATION:        r.location,
      INTERNAL_PHONE:  r.internal_phone,
      MANAGER_NAME:    r.manager_name,
      EMPLOYEE_COUNT:  r.employee_count,
    })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POSITIONS ────────────────────────────────────────────────
app.get('/api/positions', async (req, res) => {
  try {
<<<<<<< HEAD
    const result = await query(`SELECT * FROM SYSTEM.POSITION ORDER BY POSITION_ID`);
    res.json(result.rows);
=======
    // ⚠️ แก้ไขเพิ่มเครื่องหมายคำพูดรอบ "position" เรียบร้อยแล้ว
    const rows = await query(`SELECT * FROM "position" ORDER BY position_id`);
    res.json(rows.map(r => ({
    POSITION_ID:    r.position_id,
    POSITION_NAME:  r.position_name,
    DEPARTMENT_ID:  r.department_id,   // ✅ เพิ่มบรรทัดนี้
    MIN_SALARY:     r.min_salary,
    MAX_SALARY:     r.max_salary,
    SHIFT_TYPE:     r.shift_type,
  })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SHIFTS ───────────────────────────────────────────────────
app.get('/api/shifts', async (req, res) => {
  try {
<<<<<<< HEAD
    const result = await query(`SELECT * FROM SYSTEM.SHIFT ORDER BY SHIFT_ID`);
    res.json(result.rows);
=======
    const rows = await query(`SELECT * FROM shift ORDER BY shift_id`);
    res.json(rows.map(r => ({
      SHIFT_ID:   r.shift_id,
      SHIFT_NAME: r.shift_name,
      START_TIME: r.start_time,
      END_TIME:   r.end_time,
      IS_NIGHT:   r.is_night,
    })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── EMPLOYEES ────────────────────────────────────────────────
<<<<<<< HEAD
// NOTE: EMPLOYEE.POSITION_ID is NUMBER (1-5) but POSITION.POSITION_ID is VARCHAR2 (P01-P05)
// Bridge: 'P' || LPAD(TO_CHAR(e.POSITION_ID), 2, '0')

app.get('/api/employees', async (req, res) => {
  try {
    const { search, dept } = req.query;
    const binds = {};
    let where = 'WHERE 1=1';

    if (search) {
      where += ` AND (UPPER(e.FIRST_NAME) LIKE UPPER(:search) OR UPPER(e.LAST_NAME) LIKE UPPER(:search) OR TO_CHAR(e.EMPLOYEE_ID) LIKE :search2)`;
      binds.search  = `%${search}%`;
      binds.search2 = `%${search}%`;
    }
    if (dept && dept !== 'ALL') {
      where += ` AND d.DEPARTMENT_NAME = :dept`;
      binds.dept = dept;
    }

    const result = await query(`
      SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME,
             e.GENDER, e.PHONE, e.EMAIL,
             TO_CHAR(e.HIRE_DATE, 'YYYY-MM-DD') AS HIRE_DATE,
             e.STATUS, e.DEPARTMENT_ID, e.POSITION_ID,
             d.DEPARTMENT_NAME,
             p.POSITION_NAME, p.MIN_SALARY, p.MAX_SALARY, p.SHIFT_TYPE
      FROM SYSTEM.EMPLOYEE e
      LEFT JOIN SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
      LEFT JOIN SYSTEM.POSITION   p ON p.POSITION_ID = 'P' || LPAD(TO_CHAR(e.POSITION_ID), 2, '0')
      ${where}
      ORDER BY e.EMPLOYEE_ID
    `, binds);
    res.json(result.rows);
=======
app.get('/api/employees', async (req, res) => {
  try {
    const { search, dept } = req.query;
    const params = [];
    let where = 'WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (UPPER(e.first_name) LIKE UPPER($${params.length}) OR UPPER(e.last_name) LIKE UPPER($${params.length}) OR CAST(e.employee_id AS TEXT) LIKE $${params.length})`;
    }
    if (dept && dept !== 'ALL') {
      params.push(dept);
      where += ` AND d.department_name = $${params.length}`;
    }
    // ⚠️ แก้ไขเพิ่มเครื่องหมายคำพูดรอบ "position" เรียบร้อยแล้ว
    const rows = await query(`
      SELECT e.employee_id, e.first_name, e.last_name, e.gender, e.phone, e.email,
             TO_CHAR(e.hire_date, 'YYYY-MM-DD') AS hire_date, e.status,
             e.department_id, e.position_id,
             d.department_name,
             p.position_name, p.min_salary, p.max_salary, p.shift_type
      FROM employee e
      LEFT JOIN department d ON e.department_id = d.department_id
      LEFT JOIN "position" p ON e.position_id   = p.position_id
      ${where}
      ORDER BY e.employee_id
    `, params);
    res.json(rows.map(r => ({
      EMPLOYEE_ID:     r.employee_id,
      FIRST_NAME:      r.first_name,
      LAST_NAME:       r.last_name,
      GENDER:          r.gender,
      PHONE:           r.phone,
      EMAIL:           r.email,
      HIRE_DATE:       r.hire_date,
      STATUS:          r.status,
      DEPARTMENT_ID:   r.department_id,
      POSITION_ID:     r.position_id,
      DEPARTMENT_NAME: r.department_name,
      POSITION_NAME:   r.position_name,
      MIN_SALARY:      r.min_salary,
      MAX_SALARY:      r.max_salary,
      SHIFT_TYPE:      r.shift_type,
    })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees/:id', async (req, res) => {
  try {
<<<<<<< HEAD
    const result = await query(`
      SELECT e.*, d.DEPARTMENT_NAME, p.POSITION_NAME, p.MIN_SALARY, p.MAX_SALARY
      FROM SYSTEM.EMPLOYEE e
      LEFT JOIN SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
      LEFT JOIN SYSTEM.POSITION   p ON p.POSITION_ID = 'P' || LPAD(TO_CHAR(e.POSITION_ID), 2, '0')
      WHERE e.EMPLOYEE_ID = :id
    `, { id: parseInt(req.params.id) });
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
=======
    // ⚠️ แก้ไขเพิ่มเครื่องหมายคำพูดรอบ "position" เรียบร้อยแล้ว
    const rows = await query(`
      SELECT e.*, d.department_name, p.position_name, p.min_salary, p.max_salary
      FROM employee e
      LEFT JOIN department d ON e.department_id = d.department_id
      LEFT JOIN "position" p ON e.position_id   = p.position_id
      WHERE e.employee_id = $1
    `, [parseInt(req.params.id)]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const r = rows[0];
    res.json({
      EMPLOYEE_ID: r.employee_id, FIRST_NAME: r.first_name, LAST_NAME: r.last_name,
      PHONE: r.phone, EMAIL: r.email, STATUS: r.status,
      HIRE_DATE: r.hire_date ? r.hire_date.toISOString().split('T')[0] : null,
      DEPARTMENT_ID: r.department_id, POSITION_ID: r.position_id,
      DEPARTMENT_NAME: r.department_name, POSITION_NAME: r.position_name,
    });
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const { firstName, lastName, birthDate, gender, phone, email, hireDate, status, departmentId, positionId } = req.body;
<<<<<<< HEAD
    const idResult = await query(`SELECT NVL(MAX(EMPLOYEE_ID), 100) + 1 AS NEXT_ID FROM SYSTEM.EMPLOYEE`);
    const newId = idResult.rows[0].NEXT_ID;

    await query(`
      INSERT INTO SYSTEM.EMPLOYEE
        (EMPLOYEE_ID, FIRST_NAME, LAST_NAME, BIRTH_DATE, GENDER, PHONE, EMAIL, HIRE_DATE, STATUS, DEPARTMENT_ID, POSITION_ID)
      VALUES (:id, :fn, :ln,
        ${birthDate ? "TO_DATE(:bd, 'YYYY-MM-DD')" : 'NULL'},
        :gender, :phone, :email,
        TO_DATE(:hd, 'YYYY-MM-DD'),
        :status, :deptId, :posId)
    `, {
      id: newId, fn: firstName, ln: lastName,
      ...(birthDate ? { bd: birthDate } : {}),
      gender: gender || 'Male',
      phone: phone || null, email: email || null,
      hd: hireDate, status: status || 'Active',
      deptId: parseInt(departmentId), posId: parseInt(positionId)
    });
=======
    const idRows = await query(`SELECT COALESCE(MAX(employee_id), 100) + 1 AS next_id FROM employee`);
    const newId = idRows[0].next_id;
    await query(`
      INSERT INTO employee (employee_id, first_name, last_name, birth_date, gender, phone, email, hire_date, status, department_id, position_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `, [newId, firstName, lastName, birthDate||null, gender||'Male', phone||null, email||null, hireDate, status||'Active', parseInt(departmentId), positionId]);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    res.status(201).json({ message: 'Employee added', id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, status, departmentId, positionId } = req.body;
    await query(`
<<<<<<< HEAD
      UPDATE SYSTEM.EMPLOYEE
      SET FIRST_NAME = :fn, LAST_NAME = :ln,
          PHONE = :phone, EMAIL = :email, STATUS = :status,
          DEPARTMENT_ID = :deptId, POSITION_ID = :posId
      WHERE EMPLOYEE_ID = :id
    `, {
      fn: firstName, ln: lastName,
      phone: phone || null, email: email || null,
      status, deptId: parseInt(departmentId), posId: parseInt(positionId),
      id: parseInt(req.params.id)
    });
=======
      UPDATE employee SET first_name=$1, last_name=$2, phone=$3, email=$4, status=$5, department_id=$6, position_id=$7
      WHERE employee_id=$8
    `, [firstName, lastName, phone||null, email||null, status, parseInt(departmentId), positionId, parseInt(req.params.id)]);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
<<<<<<< HEAD
    await query(`DELETE FROM SYSTEM.EMPLOYEE WHERE EMPLOYEE_ID = :id`, { id: parseInt(req.params.id) });
=======
    await query(`DELETE FROM employee WHERE employee_id=$1`, [parseInt(req.params.id)]);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ATTENDANCE ───────────────────────────────────────────────
<<<<<<< HEAD
// NOTE: ATTENDANCE.SHIFT_ID stores '1','2','3' but SHIFT table uses 'S01','S02','S03'
// Bridge: 'S' || LPAD(a.SHIFT_ID, 2, '0') for the JOIN

app.get('/api/attendance', async (req, res) => {
  try {
    const { search } = req.query;
    const binds = {};
    let where = 'WHERE 1=1';
    if (search) {
      where += ` AND (UPPER(e.FIRST_NAME) LIKE UPPER(:search) OR UPPER(e.LAST_NAME) LIKE UPPER(:search))`;
      binds.search = `%${search}%`;
    }
    const result = await query(`
      SELECT a.ATTENDANCE_ID, a.EMPLOYEE_ID, a.SHIFT_ID,
             e.FIRST_NAME || ' ' || e.LAST_NAME AS EMP_NAME,
             d.DEPARTMENT_NAME,
             s.SHIFT_NAME, s.IS_NIGHT AS SHIFT_IS_NIGHT,
             TO_CHAR(a.WORK_DATE, 'YYYY-MM-DD')  AS WORK_DATE,
             TO_CHAR(a.CLOCK_IN,  'HH24:MI')      AS CLOCK_IN,
             TO_CHAR(a.CLOCK_OUT, 'HH24:MI')      AS CLOCK_OUT,
             a.WORK_HOURS, a.OT_HOURS, a.IS_NIGHT
      FROM SYSTEM.ATTENDANCE a
      JOIN  SYSTEM.EMPLOYEE   e ON a.EMPLOYEE_ID = e.EMPLOYEE_ID
      JOIN  SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
      LEFT JOIN SYSTEM.SHIFT  s ON s.SHIFT_ID = 'S' || LPAD(a.SHIFT_ID, 2, '0')
      ${where}
      ORDER BY a.WORK_DATE DESC, a.ATTENDANCE_ID DESC
    `, binds);
    res.json(result.rows);
=======
app.get('/api/attendance', async (req, res) => {
  try {
    const { search } = req.query;
    const params = [];
    let where = 'WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (UPPER(e.first_name) LIKE UPPER($1) OR UPPER(e.last_name) LIKE UPPER($1))`;
    }
    const rows = await query(`
      SELECT a.attendance_id, a.employee_id, a.shift_id,
             e.first_name || ' ' || e.last_name AS emp_name,
             d.department_name, s.shift_name, s.is_night AS shift_is_night,
             TO_CHAR(a.work_date, 'YYYY-MM-DD') AS work_date,
             TO_CHAR(a.clock_in,  'HH24:MI') AS clock_in,
             TO_CHAR(a.clock_out, 'HH24:MI') AS clock_out,
             a.work_hours, a.ot_hours, a.is_night
      FROM attendance a
      JOIN employee   e ON a.employee_id = e.employee_id
      JOIN department d ON e.department_id = d.department_id
      LEFT JOIN shift s ON a.shift_id = s.shift_id
      ${where}
      ORDER BY a.work_date DESC, a.attendance_id DESC
    `, params);
    res.json(rows.map(r => ({
      ATTENDANCE_ID: r.attendance_id, EMPLOYEE_ID: r.employee_id, SHIFT_ID: r.shift_id,
      EMP_NAME: r.emp_name, DEPARTMENT_NAME: r.department_name,
      SHIFT_NAME: r.shift_name, WORK_DATE: r.work_date,
      CLOCK_IN: r.clock_in, CLOCK_OUT: r.clock_out,
      WORK_HOURS: r.work_hours, OT_HOURS: r.ot_hours, IS_NIGHT: r.is_night,
    })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { empId, shiftId, workDate, clockIn, clockOut, workHours, otHours, isNight } = req.body;
<<<<<<< HEAD
    const idResult = await query(`
      SELECT NVL(MAX(CASE WHEN REGEXP_LIKE(ATTENDANCE_ID,'^[0-9]+$') THEN TO_NUMBER(ATTENDANCE_ID) ELSE 0 END), 0) + 1 AS NEXT_ID
      FROM SYSTEM.ATTENDANCE
    `);
    const newId = String(idResult.rows[0].NEXT_ID);

    await query(`
      INSERT INTO SYSTEM.ATTENDANCE
        (ATTENDANCE_ID, EMPLOYEE_ID, SHIFT_ID, WORK_DATE, CLOCK_IN, CLOCK_OUT, WORK_HOURS, OT_HOURS, IS_NIGHT)
      VALUES (:attId, :empId, :shiftId,
        TO_DATE(:workDate, 'YYYY-MM-DD'),
        TO_TIMESTAMP(:workDate || ' ' || :clockIn,  'YYYY-MM-DD HH24:MI'),
        TO_TIMESTAMP(:workDate || ' ' || :clockOut, 'YYYY-MM-DD HH24:MI'),
        :workHours, :otHours, :isNight)
    `, {
      attId: newId, empId: parseInt(empId), shiftId,
      workDate, clockIn, clockOut,
      workHours: workHours || 8, otHours: otHours || 0, isNight: isNight || 0
    });
=======
    const idRows = await query(`SELECT 'AD' || LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(attendance_id FROM 3) AS INTEGER)),0)+1 AS TEXT),2,'0') AS next_id FROM attendance WHERE attendance_id ~ '^AD[0-9]+'`);
    const newId = idRows[0].next_id;
    await query(`
      INSERT INTO attendance (attendance_id, employee_id, shift_id, work_date, clock_in, clock_out, work_hours, ot_hours, is_night)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, [newId, parseInt(empId), shiftId, workDate,
        `${workDate} ${clockIn}`, `${workDate} ${clockOut}`,
        workHours||8, otHours||0, isNight||0]);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    res.status(201).json({ message: 'Recorded', id: newId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
<<<<<<< HEAD
    await query(`DELETE FROM SYSTEM.ATTENDANCE WHERE ATTENDANCE_ID = :id`, { id: req.params.id });
=======
    await query(`DELETE FROM attendance WHERE attendance_id=$1`, [req.params.id]);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SALARY ───────────────────────────────────────────────────
app.get('/api/salary', async (req, res) => {
  try {
    const { month, year } = req.query;
<<<<<<< HEAD
    const binds = {};
    let where = 'WHERE 1=1';
    if (month) { where += ' AND s.SALARY_MONTH = :month'; binds.month = parseInt(month); }
    if (year)  { where += ' AND s.SALARY_YEAR  = :year';  binds.year  = parseInt(year);  }

    const result = await query(`
      SELECT s.SALARY_ID, s.EMPLOYEE_ID, s.SALARY_MONTH, s.SALARY_YEAR,
             s.BASE_SALARY, s.OT_PAY, s.NIGHT_PAY, s.SERVICE_CHARGE,
             s.DEDUCTION, s.NET_SALARY,
             TO_CHAR(s.PAYMENT_DATE, 'YYYY-MM-DD') AS PAYMENT_DATE,
             e.FIRST_NAME || ' ' || e.LAST_NAME AS EMP_NAME,
             d.DEPARTMENT_NAME
      FROM SYSTEM.SALARY s
      JOIN SYSTEM.EMPLOYEE   e ON s.EMPLOYEE_ID   = e.EMPLOYEE_ID
      JOIN SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
      ${where}
      ORDER BY s.SALARY_YEAR DESC, s.SALARY_MONTH DESC, s.EMPLOYEE_ID
    `, binds);
    res.json(result.rows);
=======
    const params = [];
    let where = 'WHERE 1=1';
    if (month) { params.push(parseInt(month)); where += ` AND s.salary_month=$${params.length}`; }
    if (year)  { params.push(parseInt(year));  where += ` AND s.salary_year=$${params.length}`; }
    
    // เปลี่ยนมาใช้ LEFT JOIN ป้องกันข้อมูลหายถ้าพนักงานไม่มีแผนก
    const rows = await query(`
      SELECT s.salary_id, s.employee_id, s.salary_month, s.salary_year,
             s.base_salary, s.ot_pay, s.night_pay, s.service_charge,
             s.deduction, s.net_salary,
             TO_CHAR(s.payment_date,'YYYY-MM-DD') AS payment_date,
             e.first_name || ' ' || e.last_name AS emp_name,
             d.department_name
      FROM salary s
      LEFT JOIN employee   e ON s.employee_id   = e.employee_id
      LEFT JOIN department d ON e.department_id = d.department_id
      ${where}
      ORDER BY s.salary_year DESC, s.salary_month DESC, s.employee_id
    `, params);
    
    res.json(rows.map(r => ({
      SALARY_ID: r.salary_id, EMPLOYEE_ID: r.employee_id,
      SALARY_MONTH: r.salary_month, SALARY_YEAR: r.salary_year,
      BASE_SALARY: r.base_salary, OT_PAY: r.ot_pay, NIGHT_PAY: r.night_pay,
      SERVICE_CHARGE: r.service_charge, DEDUCTION: r.deduction, NET_SALARY: r.net_salary,
      PAYMENT_DATE: r.payment_date, EMP_NAME: r.emp_name, DEPARTMENT_NAME: r.department_name,
    })));
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/salary/:salaryId/detail', async (req, res) => {
  try {
<<<<<<< HEAD
    const [salRow, detailRow] = await Promise.all([
      query(`
        SELECT s.*, e.FIRST_NAME || ' ' || e.LAST_NAME AS EMP_NAME,
               e.EMPLOYEE_ID, d.DEPARTMENT_NAME, p.POSITION_NAME
        FROM SYSTEM.SALARY s
        JOIN SYSTEM.EMPLOYEE   e ON s.EMPLOYEE_ID   = e.EMPLOYEE_ID
        JOIN SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
        LEFT JOIN SYSTEM.POSITION p ON p.POSITION_ID = 'P' || LPAD(TO_CHAR(e.POSITION_ID), 2, '0')
        WHERE s.SALARY_ID = :id
      `, { id: req.params.salaryId }),
      query(`SELECT * FROM SYSTEM.SALARYDETAIL WHERE SALARY_ID = :id ORDER BY DETAIL_ID`,
        { id: req.params.salaryId })
    ]);
    if (!salRow.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ salary: salRow.rows[0], details: detailRow.rows });
=======
    const [salRows, detRows] = await Promise.all([
      // เปลี่ยนมาใช้ LEFT JOIN เช่นกัน
      query(`
        SELECT s.*, e.first_name || ' ' || e.last_name AS emp_name,
               e.employee_id, d.department_name, p.position_name
        FROM salary s
        LEFT JOIN employee   e ON s.employee_id   = e.employee_id
        LEFT JOIN department d ON e.department_id = d.department_id
        LEFT JOIN "position" p ON e.position_id   = p.position_id
        WHERE s.salary_id=$1
      `, [req.params.salaryId]),
      query(`SELECT * FROM salarydetail WHERE salary_id=$1 ORDER BY detail_id`, [req.params.salaryId])
    ]);
    
    if (!salRows.length) return res.status(404).json({ error: 'Not found' });
    const s = salRows[0];
    
    res.json({
      salary: {
        SALARY_ID: s.salary_id, EMPLOYEE_ID: s.employee_id, EMP_NAME: s.emp_name,
        DEPARTMENT_NAME: s.department_name, POSITION_NAME: s.position_name,
        SALARY_MONTH: s.salary_month, SALARY_YEAR: s.salary_year,
        BASE_SALARY: s.base_salary, OT_PAY: s.ot_pay, NIGHT_PAY: s.night_pay,
        SERVICE_CHARGE: s.service_charge, DEDUCTION: s.deduction, NET_SALARY: s.net_salary,
      },
      details: detRows.map(d => ({
        DETAIL_ID: d.detail_id, DETAIL_TYPE: d.detail_type, AMOUNT: d.amount
      }))
    });
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── START ────────────────────────────────────────────────────
<<<<<<< HEAD
const PORT = 3000;
initPool().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`   App:    http://localhost:${PORT}/index-oracle.html`);
  });
=======
// ✅ เปลี่ยนให้รับ Port จาก Render อัตโนมัติ (ถ้าทดสอบในเครื่องจะใช้ 3000)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`   App:    http://localhost:${PORT}/index-oracle.html`);
>>>>>>> 0c151ffca047aa741c2cd9a97c5293bddfa6531c
});