const API_URL = 'http://localhost:3000/api';

// เมื่อโหลดหน้าเว็บเสร็จให้เริ่มทำงาน
document.addEventListener('DOMContentLoaded', () => {
    navigate('dashboard');
    loadDashboard();
    loadEmployees();
    loadAttendance();
});

// --- ระบบ NAVIGATION ---
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    // เพิ่ม class active ให้เมนูที่กด
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if(item.innerText.toLowerCase().includes(pageId)) item.classList.add('active');
    });

    // โหลดข้อมูลใหม่ทุกครั้งที่สลับหน้า
    if(pageId === 'employees') loadEmployees();
    if(pageId === 'attendance') loadAttendance();
}

// --- การจัดการ EMPLOYEE (พนักงาน) ---

async function loadEmployees() {
    try {
        const response = await fetch(`${API_URL}/employees`);
        const employees = await response.json();
        renderEmployeeTable(employees);
    } catch (err) {
        showToast('ไม่สามารถโหลดข้อมูลพนักงานได้', 'error');
    }
}

function renderEmployeeTable(data) {
    const tbody = document.getElementById('empTableBody');
    const searchTerm = document.getElementById('empSearch').value.toLowerCase();
    
    tbody.innerHTML = '';
    
    const filtered = data.filter(emp => 
        emp.FIRST_NAME.toLowerCase().includes(searchTerm) || 
        emp.LAST_NAME.toLowerCase().includes(searchTerm)
    );

    filtered.forEach(emp => {
        tbody.innerHTML += `
            <tr>
                <td>${emp.EMPLOYEE_ID}</td>
                <td>${emp.FIRST_NAME} ${emp.LAST_NAME}</td>
                <td>${emp.DEPARTMENT_NAME || '-'}</td>
                <td>${emp.POSITION_NAME || '-'}</td>
                <td><span class="badge">Morning</span></td> <td>${(emp.MIN_SALARY || 15000).toLocaleString()} ฿</td>
                <td><span class="status-pill ${emp.STATUS === 'Active' ? 'status-active' : 'status-inactive'}">${emp.STATUS}</span></td>
                <td>
                    <button class="btn-icon" onclick="editEmployee(${emp.EMPLOYEE_ID})">✏️</button>
                    <button class="btn-icon" style="color:red">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// --- การจัดการ ATTENDANCE (บันทึกเวลา) ---

async function loadAttendance() {
    try {
        const response = await fetch(`${API_URL}/employees`); // ดึงรายชื่อพนักงานใส่ใน Select ของ Modal
        const employees = await response.json();
        const select = document.getElementById('attEmpId');
        select.innerHTML = employees.map(e => `<option value="${e.EMPLOYEE_ID}">${e.FIRST_NAME} ${e.LAST_NAME}</option>`).join('');
    } catch (err) {
        console.error(err);
    }
}

async function saveAttendance() {
    const data = {
        empId: document.getElementById('attEmpId').value,
        workDate: document.getElementById('attDate').value,
        shiftId: document.getElementById('attShift').value === 'Morning' ? '1' : '2',
        clockIn: document.getElementById('attTimeIn').value + ':00',
        clockOut: document.getElementById('attTimeOut').value + ':00',
        workHours: 8, // ค่าสมมติเบื้องต้น
        otHours: 0,
        isNight: document.getElementById('attShift').value === 'Night' ? 1 : 0
    };

    try {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('บันทึกเวลาสำเร็จ!', 'success');
            closeModal('attModal');
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
}

// --- ระบบ UI HELPERS ---

function openEmpModal() {
    document.getElementById('empModalTitle').innerText = 'เพิ่มพนักงานใหม่';
    document.getElementById('empModal').classList.add('active');
}

function openAttModal() {
    document.getElementById('attDate').valueAsDate = new Date();
    document.getElementById('attModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Dashboard Logic ---
async function loadDashboard() {
    // โค้ดจำลองข้อมูล Dashboard
    const stats = document.getElementById('dashStats');
    stats.innerHTML = `
        <div class="stat-card"><h3>24</h3><p>พนักงานทั้งหมด</p></div>
        <div class="stat-card"><h3>18</h3><p>เข้างานวันนี้</p></div>
        <div class="stat-card"><h3>2</h3><p>ลางาน</p></div>
    `;
}
