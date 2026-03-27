const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 1. Configuration - ตรวจสอบ user/password/connectString ให้ตรงกับเครื่องคุณ
const DB_CONFIG = {
  user: 'SYSTEM',
  password: 'your_password', 
  connectString: 'localhost:1521/xe', // หรือ 'localhost:1521/XEPDB1'
};

// Initialize Connection Pool
async function initPool() {
  try {
    await oracledb.createPool({
      ...DB_CONFIG,
      poolMin: 2,
      poolMax: 10,
    });
    console.log('✅ เชื่อมต่อ Oracle Database สำเร็จ (Schema: SYSTEM)');
  } catch (err) {
    console.error('❌ เชื่อมต่อ Oracle ไม่ได้:', err);
    process.exit(1);
  }
}

// Helper Function สำหรับรัน SQL
async function query(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...opts,
    });
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

// ============================================================
//  API: EMPLOYEES (ดึงข้อมูลพนักงาน)
// ============================================================
app.get('/api/employees', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT e.EMPLOYEE_ID, e.FIRST_NAME, e.LAST_NAME, 
             d.DEPARTMENT_NAME, p.POSITION_NAME, 
             e.STATUS, e.PHONE
      FROM SYSTEM.EMPLOYEE e
      LEFT JOIN SYSTEM.DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPARTMENT_ID
      LEFT JOIN SYSTEM.POSITION p   ON e.POSITION_ID   = p.POSITION_ID
      WHERE 1=1
    `;
    const binds = [];
    if (search) {
      sql += ` AND (UPPER(e.FIRST_NAME) LIKE UPPER(:search) OR UPPER(e.LAST_NAME) LIKE UPPER(:search))`;
      binds.push(`%${search}%`);
    }
    sql += ` ORDER BY e.EMPLOYEE_ID`;
    
    const result = await query(sql, binds);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  API: ATTENDANCE (บันทึกเวลาทำงาน)
// ============================================================
app.post('/api/attendance', async (req, res) => {
  try {
    const { empId, shiftId, workDate, clockIn, clockOut, workHours, otHours, isNight } = req.body;
    
    // สร้าง ID (เนื่องจาก ATTENDANCE_ID ใน DDL เป็น VARCHAR2)
    const attId = Date.now().toString().substring(0, 20);

    const sql = `
      INSERT INTO SYSTEM.ATTENDANCE 
        (ATTENDANCE_ID, EMPLOYEE_ID, SHIFT_ID, WORK_DATE, CLOCK_IN, CLOCK_OUT, WORK_HOURS, OT_HOURS, IS_NIGHT)
      VALUES (:1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), 
              TO_TIMESTAMP(:5, 'YYYY-MM-DD HH24:MI:SS'), 
              TO_TIMESTAMP(:6, 'YYYY-MM-DD HH24:MI:SS'), 
              :7, :8, :9)
    `;

    await query(sql, [
      attId, empId, shiftId, workDate, 
      `${workDate} ${clockIn}`, `${workDate} ${clockOut}`, 
      workHours || 8, otHours || 0, isNight || 0
    ]);

    res.status(201).json({ message: 'บันทึกเวลาเรียบร้อย', id: attId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
//  API: SALARY (ดึงข้อมูลเงินเดือน)
// ============================================================
app.get('/api/salary', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM SYSTEM.SALARY ORDER BY SALARY_YEAR DESC, SALARY_MONTH DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = 3000;
initPool().then(() => {
  app.listen(PORT, () => console.log(`🚀 API Server รันอยู่ที่ http://localhost:${PORT}`));
});
