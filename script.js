
// ========== CONFIG ==========
// ✅ เปลี่ยน URL นี้ให้ตรงกับ Backend ที่รัน
const API_BASE = 'http://localhost:5500/api';

const DEPT_COLORS = { 'Housekeeping':'dept-hk','F&B':'dept-fb','Front Office':'dept-fo','Maintenance':'dept-mt','Security':'dept-sc' };
const DEPT_ICONS  = { 'Housekeeping':'🛏️','F&B':'🍽️','Front Office':'🛎️','Maintenance':'🔧','Security':'🔒' };

let departments=[], positions=[], shifts=[], employees=[];
let currentEmpId=null, empFilterDept='ALL';

// ========== API HELPER ==========
async function api(path, method='GET', body=null) {
  const opts = { method, headers:{'Content-Type':'application/json'} };
  if(body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'API Error');
  return data;
}

// ========== TOAST ==========
function showToast(msg, type='success') {
  const t=document.getElementById('toastContainer');
  const d=document.createElement('div');
  d.className=`toast ${type}`;
  d.innerHTML=`<span>${type==='success'?'✅':'❌'}</span> ${msg}`;
  t.appendChild(d);
  setTimeout(()=>d.remove(), 3500);
}

function fmt(n){ return Number(n||0).toLocaleString('th-TH',{minimumFractionDigits:0,maximumFractionDigits:0}); }
function shiftIcon(s){ return s==='Morning'?'🌅':s==='Afternoon'?'☀️':'🌙'; }
function deptColor(d){ return DEPT_COLORS[d]||'dept-hk'; }

// ========== HEALTH CHECK ==========
async function checkHealth() {
  try {
    await api('/health');
    document.getElementById('apiDot').classList.remove('error');
    document.getElementById('apiStatus').textContent = 'เชื่อมต่อ Oracle แล้ว';
  } catch {
    document.getElementById('apiDot').classList.add('error');
    document.getElementById('apiStatus').textContent = 'ไม่สามารถเชื่อมต่อได้';
  }
}

// ========== INIT: โหลด Dropdown Data ==========
async function initDropdowns() {
  try {
    [departments, positions, shifts] = await Promise.all([
      api('/departments'), api('/positions'), api('/shifts')
    ]);
  } catch(e) { console.warn('โหลด dropdown ไม่ได้:', e.message); }
}

// ========== NAVIGATE ==========
function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-item')[['dashboard','employees','attendance','salary','departments'].indexOf(page)].classList.add('active');
  if(page==='dashboard')   loadDashboard();
  if(page==='employees')   loadEmployees();
  if(page==='attendance')  loadAttendance();
  if(page==='salary')      ;  // user กด button เอง
  if(page==='departments') loadDepartments();
}

// ========== DASHBOARD ==========
async function loadDashboard() {
  try {
    const emps = await api('/employees');
    const atts = await api('/attendance');
    const active = emps.filter(e=>e.STATUS==='Active').length;
    const night  = emps.filter(e=>e.SHIFT==='Night').length;
    const depts  = [...new Set(emps.map(e=>e.DEPT))].length;
    document.getElementById('dashStats').innerHTML = [
      {label:'พนักงานทั้งหมด', value:emps.length, sub:`${active} Active`},
      {label:'แผนก', value:depts, sub:'จาก Oracle DB'},
      {label:'กะดึก (Night Shift)', value:night, sub:'+30% Premium'},
      {label:'บันทึกเวลาทั้งหมด', value:atts.length, sub:'รายการใน DB'},
    ].map(s=>`<div class="stat-card"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-sub">${s.sub}</div></div>`).join('');

    document.getElementById('dashRecentBody').innerHTML = emps.slice(0,5).map(e=>`
      <tr>
        <td style="color:var(--muted);font-size:12px">${e.EMPLOYEE_ID}</td>
        <td class="emp-name">${e.FIRST_NAME} ${e.LAST_NAME}</td>
        <td><span class="dept-badge ${deptColor(e.DEPT)}">${e.DEPT}</span></td>
        <td style="font-size:12px">${e.POSITION}</td>
        <td style="font-size:12px">${shiftIcon(e.SHIFT)} ${e.SHIFT}</td>
        <td class="${e.STATUS==='Active'?'status-active':'status-inactive'}">${e.STATUS}</td>
      </tr>`).join('');
  } catch(err) {
    showToast('โหลด Dashboard ไม่ได้: '+err.message,'error');
  }
}

// ========== EMPLOYEES ==========
function filterEmp(dept, btn) {
  empFilterDept = dept;
  document.querySelectorAll('#page-employees .btn-outline[onclick^="filterEmp"]').forEach(b=>{
    b.style.color=''; b.style.borderColor='';
  });
  btn.style.color='var(--gold)'; btn.style.borderColor='var(--gold)';
  loadEmployees();
}

async function loadEmployees() {
  const search = document.getElementById('empSearch')?.value;
  let url = '/employees?';
  if(empFilterDept !== 'ALL') url += `dept=${encodeURIComponent(empFilterDept)}&`;
  if(search) url += `search=${encodeURIComponent(search)}`;
  try {
    employees = await api(url);
    renderEmployeeTable(employees);
  } catch(err) {
    document.getElementById('empTableBody').innerHTML =
      `<tr><td colspan="8"><div class="empty-state"><div>❌ ${err.message}</div></div></td></tr>`;
  }
}

function renderEmployeeTable(data) {
  const tbody = document.getElementById('empTableBody');
  if(!data.length) { tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><div class="icon" style="font-size:40px;opacity:.4">👤</div><div>ไม่พบพนักงาน</div></div></td></tr>`; return; }
  tbody.innerHTML = data.map(e=>`
    <tr>
      <td style="color:var(--muted);font-size:12px">${e.EMPLOYEE_ID}</td>
      <td class="emp-name">${e.FIRST_NAME} ${e.LAST_NAME}</td>
      <td><span class="dept-badge ${deptColor(e.DEPT)}">${e.DEPT}</span></td>
      <td style="font-size:12px">${e.POSITION}</td>
      <td style="font-size:12px">${shiftIcon(e.SHIFT)} ${e.SHIFT}</td>
      <td style="color:var(--gold)">${fmt(e.SALARY)} ฿</td>
      <td class="${e.STATUS==='Active'?'status-active':'status-inactive'}">${e.STATUS}</td>
      <td>
        <button class="action-btn" onclick="editEmployee('${e.EMPLOYEE_ID}')">✏️</button>
        <button class="action-btn" onclick="deleteEmployee('${e.EMPLOYEE_ID}')">🗑️</button>
      </td>
    </tr>`).join('');
}

async function openEmpModal(id=null) {
  currentEmpId = id;
  // โหลด departments dropdown
  const deptSel = document.getElementById('empDeptId');
  deptSel.innerHTML = departments.map(d=>`<option value="${d.DEPARTMENT_ID}">${d.DEPARTMENT_NAME}</option>`).join('');
  await loadPositionsDropdown();
  // shifts
  document.getElementById('empShiftId').innerHTML = shifts.map(s=>`<option value="${s.SHIFT_ID}">${shiftIcon(s.SHIFT_NAME)} ${s.SHIFT_NAME}</option>`).join('');

  if(id) {
    document.getElementById('empModalTitle').textContent = 'แก้ไขข้อมูลพนักงาน';
    const e = employees.find(x=>x.EMPLOYEE_ID===id);
    if(e) {
      document.getElementById('empFirstName').value = e.FIRST_NAME;
      document.getElementById('empLastName').value  = e.LAST_NAME;
      document.getElementById('empSalary').value    = e.SALARY;
      document.getElementById('empPhone').value     = e.PHONE||'';
      document.getElementById('empHireDate').value  = (e.HIRE_DATE||'').split('T')[0];
      document.getElementById('empStatus').value    = e.STATUS;
    }
  } else {
    document.getElementById('empModalTitle').textContent = 'เพิ่มพนักงานใหม่';
    ['empFirstName','empLastName','empSalary','empPhone'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('empHireDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('empStatus').value = 'Active';
  }
  document.getElementById('empModal').classList.add('open');
}

async function loadPositionsDropdown() {
  const deptId = document.getElementById('empDeptId')?.value;
  const pos = await api('/positions'+(deptId?`?deptId=${deptId}`:''));
  document.getElementById('empPositionId').innerHTML = pos.map(p=>`<option value="${p.POSITION_ID}">${p.POSITION_TITLE}</option>`).join('');
}

async function editEmployee(id) { await openEmpModal(id); }

async function deleteEmployee(id) {
  if(!confirm('ยืนยันการลบพนักงานนี้?\n(จะลบออกจาก Oracle Database)')) return;
  try {
    await api(`/employees/${id}`, 'DELETE');
    showToast('ลบพนักงานเรียบร้อย (Oracle อัปเดตแล้ว)');
    loadEmployees();
  } catch(err) { showToast(err.message,'error'); }
}

async function saveEmployee() {
  const body = {
    firstName:   document.getElementById('empFirstName').value.trim(),
    lastName:    document.getElementById('empLastName').value.trim(),
    deptId:      document.getElementById('empDeptId').value,
    positionId:  document.getElementById('empPositionId').value,
    shiftId:     document.getElementById('empShiftId').value,
    salary:      parseFloat(document.getElementById('empSalary').value),
    phone:       document.getElementById('empPhone').value,
    hireDate:    document.getElementById('empHireDate').value,
    status:      document.getElementById('empStatus').value,
  };
  if(!body.firstName||!body.lastName||!body.salary) { showToast('กรุณากรอกข้อมูลให้ครบ','error'); return; }
  try {
    if(currentEmpId) {
      await api(`/employees/${currentEmpId}`, 'PUT', body);
      showToast('อัปเดต Oracle DB เรียบร้อย');
    } else {
      const res = await api('/employees', 'POST', body);
      showToast(`เพิ่มพนักงาน ${res.employeeId} ลง Oracle เรียบร้อย`);
    }
    closeModal('empModal');
    loadEmployees();
  } catch(err) { showToast(err.message,'error'); }
}

// ========== ATTENDANCE ==========
async function loadAttendance() {
  try {
    const data = await api('/attendance');
    const q = document.getElementById('attSearch')?.value.toLowerCase();
    const filtered = q ? data.filter(a=>(a.EMPID+a.NAME+a.SHIFT+a.STATUS).toLowerCase().includes(q)) : data;
    const tbody = document.getElementById('attTableBody');
    if(!filtered.length) { tbody.innerHTML=`<tr><td colspan="10"><div class="empty-state">ไม่พบข้อมูล</div></td></tr>`; return; }
    tbody.innerHTML = filtered.map(a=>`
      <tr>
        <td style="font-size:12px">${a.DATE}</td>
        <td style="color:var(--muted);font-size:12px">${a.EMPID}</td>
        <td class="emp-name">${a.NAME}</td>
        <td>${shiftIcon(a.SHIFT)} ${a.SHIFT}${a.ISNIGHTSHIFT==1?' <span style="color:#b464ff;font-size:10px">+30%</span>':''}</td>
        <td>${a.TIMEIN||'-'}</td>
        <td>${a.TIMEOUT||'-'}</td>
        <td>${a.WORKHOURS||0} ชม.</td>
        <td style="color:${a.OTHOURS>0?'var(--warning)':'var(--muted)'}">${a.OTHOURS>0?a.OTHOURS+' ชม.':'-'}</td>
        <td class="${a.STATUS==='มาทำงาน'?'att-present':a.STATUS==='สาย'?'att-late':'att-absent'}">${a.STATUS}</td>
        <td><button class="action-btn" onclick="deleteAttendance('${a.ID}')">🗑️</button></td>
      </tr>`).join('');
  } catch(err) { showToast('โหลดข้อมูลไม่ได้: '+err.message,'error'); }
}

async function openAttModal() {
  const emps = await api('/employees');
  document.getElementById('attEmpId').innerHTML = emps.filter(e=>e.STATUS==='Active').map(e=>`<option value="${e.EMPLOYEE_ID}">${e.EMPLOYEE_ID} — ${e.FIRST_NAME} ${e.LAST_NAME}</option>`).join('');
  document.getElementById('attShiftId').innerHTML = shifts.map(s=>`<option value="${s.SHIFT_ID}">${shiftIcon(s.SHIFT_NAME)} ${s.SHIFT_NAME}</option>`).join('');
  document.getElementById('attDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('attModal').classList.add('open');
}

async function saveAttendance() {
  const body = {
    empId:   document.getElementById('attEmpId').value,
    date:    document.getElementById('attDate').value,
    shiftId: document.getElementById('attShiftId').value,
    timeIn:  document.getElementById('attTimeIn').value,
    timeOut: document.getElementById('attTimeOut').value,
    status:  document.getElementById('attStatus').value,
  };
  if(!body.date||!body.timeIn||!body.timeOut) { showToast('กรุณากรอกข้อมูลให้ครบ','error'); return; }
  try {
    await api('/attendance', 'POST', body);
    showToast('บันทึกเวลาลง Oracle เรียบร้อย');
    closeModal('attModal');
    loadAttendance();
  } catch(err) { showToast(err.message,'error'); }
}

async function deleteAttendance(id) {
  try {
    await api(`/attendance/${id}`, 'DELETE');
    showToast('ลบรายการเรียบร้อย');
    loadAttendance();
  } catch(err) { showToast(err.message,'error'); }
}

// ========== SALARY ==========
async function loadSalary() {
  const month = document.getElementById('salaryMonth').value;
  try {
    const data = await api(`/salary?month=${month}&year=2025`);
    const tbody = document.getElementById('salaryTableBody');
    if(!data.length) { tbody.innerHTML=`<tr><td colspan="10"><div class="empty-state">ไม่พบข้อมูล</div></td></tr>`; return; }
    tbody.innerHTML = data.map(r=>`
      <tr>
        <td style="color:var(--muted);font-size:12px">${r.EMPLOYEE_ID}</td>
        <td class="emp-name">${r.FIRST_NAME} ${r.LAST_NAME}</td>
        <td><span class="dept-badge ${deptColor(r.DEPT)}">${r.DEPT}</span></td>
        <td>${fmt(r.BASE_SALARY)} ฿</td>
        <td style="color:${r.OT_PAY>0?'var(--warning)':'var(--muted)'}">${r.OT_PAY>0?fmt(r.OT_PAY)+' ฿':'-'}</td>
        <td style="color:${r.NIGHT_PAY>0?'#b464ff':'var(--muted)'}">${r.NIGHT_PAY>0?fmt(r.NIGHT_PAY)+' ฿':'-'}</td>
        <td style="color:${r.SERVICE_CHARGE>0?'var(--success)':'var(--muted)'}">${r.SERVICE_CHARGE>0?fmt(r.SERVICE_CHARGE)+' ฿':'-'}</td>
        <td style="color:var(--danger)">${fmt(r.DEDUCTION)} ฿</td>
        <td style="color:var(--gold);font-weight:600">${fmt(r.NET)} ฿</td>
        <td><button class="btn btn-outline" style="padding:4px 10px;font-size:11px" onclick='showSalaryDetail(${JSON.stringify(r)})'>📄 สลิป</button></td>
      </tr>`).join('');
    showToast(`ประมวลผลเสร็จ — ${data.length} คน`);
  } catch(err) { showToast('เกิดข้อผิดพลาด: '+err.message,'error'); }
}

function showSalaryDetail(r) {
  document.getElementById('salDetailBody').innerHTML = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-family:'Playfair Display',serif;font-size:16px;color:var(--gold2)">Grand Palace Hotel</div>
      <div style="font-size:12px;color:var(--muted);margin-top:2px">ใบสลิปเงินเดือน — ${r.FIRST_NAME} ${r.LAST_NAME} (${r.EMPLOYEE_ID})</div>
      <div style="font-size:12px;color:var(--muted)">${r.DEPT}</div>
    </div>
    <div class="salary-breakdown">
      <div class="salary-row"><span>เงินเดือนพื้นฐาน</span><span class="plus">${fmt(r.BASE_SALARY)} ฿</span></div>
      <div class="salary-row"><span>ค่าล่วงเวลา OT (×1.5)</span><span class="plus">${fmt(r.OT_PAY)} ฿</span></div>
      <div class="salary-row"><span>ค่ากะดึก Night Shift (×1.3)</span><span class="plus">${fmt(r.NIGHT_PAY)} ฿</span></div>
      <div class="salary-row"><span>ค่าบริการ Service Charge</span><span class="plus">${fmt(r.SERVICE_CHARGE)} ฿</span></div>
      <div class="salary-row"><span>หักประกันสังคม</span><span class="minus">-${fmt(r.SOCIAL_SEC)} ฿</span></div>
      <div class="salary-row"><span>หักภาษีเงินได้</span><span class="minus">-${fmt(r.TAX)} ฿</span></div>
      <div class="salary-row"><span>💰 เงินเดือนสุทธิ</span><span>${fmt(r.NET)} ฿</span></div>
    </div>`;
  document.getElementById('salDetailModal').classList.add('open');
}

// ========== DEPARTMENTS ==========
async function loadDepartments() {
  try {
    const depts = await api('/departments');
    const empsAll = await api('/employees');
    const container = document.getElementById('deptCards');
    container.innerHTML = depts.map(d=>{
      const emps = empsAll.filter(e=>e.DEPT===d.DEPARTMENT_NAME);
      const avg = emps.length ? Math.round(emps.reduce((s,e)=>s+(+e.SALARY),0)/emps.length) : 0;
      return `
        <div class="table-card" style="padding:24px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="font-size:32px">${DEPT_ICONS[d.DEPARTMENT_NAME]||'🏨'}</div>
            <div>
              <div style="font-weight:600;font-size:16px;color:var(--cream)">${d.DEPARTMENT_NAME}</div>
              <span class="dept-badge ${deptColor(d.DEPARTMENT_NAME)}" style="margin-top:4px">${emps.length} คน</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Location</span><span>${d.LOCATION||'-'}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">เงินเดือนเฉลี่ย</span><span style="color:var(--gold)">${fmt(avg)} ฿</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">โทรภายใน</span><span>${d.PHONE_EXT||'-'}</span></div>
          </div>
        </div>`;
    }).join('');
  } catch(err) { showToast('โหลดแผนกไม่ได้: '+err.message,'error'); }
}

// ========== MODAL ==========
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m=>{
  m.addEventListener('click',e=>{ if(e.target===m) m.classList.remove('open'); });
});

// ========== BOOT ==========
(async () => {
  await checkHealth();
  await initDropdowns();
  await loadDashboard();
  setInterval(checkHealth, 30000);
})();