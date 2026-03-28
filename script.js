const API_URL = 'http://localhost:3000/api';

// เมื่อโหลดหน้าเว็บเสร็จให้เริ่มทำงาน
document.addEventListener('DOMContentLoaded', () => {
    navigate('dashboard'); // เริ่มต้นที่หน้า Dashboard
    checkApiStatus();      // เช็คว่า Node.js ติดอยู่ไหม
});

// --- เช็คสถานะการเชื่อมต่อ API ---
async function checkApiStatus() {
    try {
        // ทดลองยิงไปขอพนักงานแค่ 1 คน เพื่อเช็คว่าต่อฐานข้อมูลติดไหม
        const response = await fetch(`${API_URL}/employees`); 
        if (response.ok) {
            document.getElementById('apiDot').style.backgroundColor = '#10b981'; // สีเขียว
            document.getElementById('apiStatus').innerText = 'Connected to Oracle';
        } else {
            throw new Error('API Error');
        }
    } catch (err) {
        document.getElementById('apiDot').style.backgroundColor = '#ef4444'; // สีแดง
        document.getElementById('apiStatus').innerText = 'Connection Failed';
        console.error("API Connection Failed:", err);
    }
}

// --- ระบบ NAVIGATION ---
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    const pageElement = document.getElementById(`page-${pageId}`);
    if (pageElement) pageElement.classList.add('active');

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        // ให้ปุ่มเมนูด้านซ้ายเปลี่ยนสีเวลากด
        if (item.getAttribute('onclick').includes(pageId)) item.classList.add('active');
    });

    // โหลดข้อมูลใหม่ทุกครั้งที่สลับหน้า
    if(pageId === 'dashboard') loadDashboard();
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
        console.error("Error loading employees:", err);
        showToast('ไม่สามารถโหลดข้อมูลพนักงานได้', 'error');
    }
}

function renderEmployeeTable(data) {
    const tbody = document.getElementById('empTableBody');
    if (!tbody) return; 

    const searchInput = document.getElementById('empSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    tbody.innerHTML = '';
    
    if (!Array.isArray(data)) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
        return;
    }

    const filtered = data.filter(emp => {
        const firstName = emp.FIRST_NAME ? String(emp.FIRST_NAME).toLowerCase() : '';
        const lastName = emp.LAST_NAME ? String(emp.LAST_NAME).toLowerCase() : '';
        return firstName.includes(searchTerm) || lastName.includes(searchTerm);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">ไม่พบข้อมูลพนักงาน</td></tr>`;
        return;
    }

    filtered.forEach(emp => {
        // ดักเรื่องเงินเดือนเผื่อชื่อคอลัมน์ในฐานข้อมูลไม่เหมือนกัน
        const salary = emp.BASE_SALARY || emp.MIN_SALARY || emp.SALARY || 0; 
        
        tbody.innerHTML += `
            <tr>
                <td>${emp.EMPLOYEE_ID || '-'}</td>
                <td>${emp.FIRST_NAME || '-'} ${emp.LAST_NAME || ''}</td>
                <td>${emp.DEPARTMENT_NAME || '-'}</td>
                <td>${emp.POSITION_NAME || '-'}</td>
                <td><span class="badge">Morning</span></td> 
                <td>${Number(salary).toLocaleString()} ฿</td>
                <td><span class="status-pill ${emp.STATUS === 'Active' ? 'status-active' : 'status-inactive'}">${emp.STATUS || 'Active'}</span></td>
                <td>
                    <button class="btn-icon" onclick="alert('กำลังพัฒนาระบบแก้ไขพนักงาน ID: ${emp.EMPLOYEE_ID}')">✏️</button>
                    <button class="btn-icon" style="color:red" onclick="alert('กำลังพัฒนาระบบลบพนักงาน')">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// --- การจัดการ ATTENDANCE (บันทึกเวลา) ---
async function loadAttendance() {
    try {
        // ดึงพนักงานมาใส่ Dropdown ใน Modal บันทึกเวลา
        const empResponse = await fetch(`${API_URL}/employees`); 
        const employees = await empResponse.json();
        const selectEmp = document.getElementById('attEmpId');
        
        if (selectEmp && Array.isArray(employees)) {
            selectEmp.innerHTML = employees.map(e => `<option value="${e.EMPLOYEE_ID}">${e.FIRST_NAME || ''} ${e.LAST_NAME || ''}</option>`).join('');
        }

        // TODO: สำหรับดึงประวัติเวลาทำงานมาลงตาราง (ตอนนี้ทำหลอกไว้ก่อน)
        const tbody = document.getElementById('attTableBody');
        if (tbody) {
             tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">ระบบดึงข้อมูลเวลายังไม่เสร็จสมบูรณ์</td></tr>`;
        }

    } catch (err) {
        console.error("Error loading attendance data:", err);
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
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('active');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    // กำหนดสีตามประเภท (เขียว=สำเร็จ, แดง=พัง)
    toast.style.backgroundColor = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.marginTop = '10px';
    toast.innerText = msg;
    
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- Dashboard Logic ---
async function loadDashboard() {
    const stats = document.getElementById('dashStats');
    if (!stats) return;

    // ส่วนนี้เดี๋ยวคุณต้องไปเขียน API ใน server.js เพื่อดึงตัวเลขจริงๆ มาใส่ครับ
    // อันนี้ใส่ตัวเลขหลอกไว้ให้หน้าเว็บไม่ว่างก่อนครับ
    stats.innerHTML = `
        <div class="stat-card"><div class="stat-label">พนักงานทั้งหมด</div><div class="stat-value" style="font-size:24px;font-weight:bold;">24</div></div>
        <div class="stat-card"><div class="stat-label">เข้างานวันนี้</div><div class="stat-value" style="font-size:24px;font-weight:bold;color:#10b981;">18</div></div>
        <div class="stat-card"><div class="stat-label">ลางาน/ขาด</div><div class="stat-value" style="font-size:24px;font-weight:bold;color:#ef4444;">2</div></div>
        <div class="stat-card"><div class="stat-label">แผนกทั้งหมด</div><div class="stat-value" style="font-size:24px;font-weight:bold;">5</div></div>
    `;

    // อัปเดตตารางหน้า Dashboard
    try {
        const response = await fetch(`${API_URL}/employees`);
        const employees = await response.json();
        const tbody = document.getElementById('dashRecentBody');
        
        if (tbody && Array.isArray(employees)) {
            tbody.innerHTML = '';
            // เอามาโชว์แค่ 5 คนแรกพอ
            employees.slice(0, 5).forEach(emp => {
                tbody.innerHTML += `
                    <tr>
                        <td>${emp.EMPLOYEE_ID || '-'}</td>
                        <td>${emp.FIRST_NAME || '-'}</td>
                        <td>${emp.DEPARTMENT_NAME || '-'}</td>
                        <td>${emp.POSITION_NAME || '-'}</td>
                        <td><span class="badge">Morning</span></td>
                        <td><span class="status-pill ${emp.STATUS === 'Active' ? 'status-active' : 'status-inactive'}">${emp.STATUS || 'Active'}</span></td>
                    </tr>
                `;
            });
        }
    } catch(err) {
        console.error(err);
    }
}