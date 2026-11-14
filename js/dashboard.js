let students = [];
const $ = id => document.getElementById(id);
const dialog = $("studentDialog");
const message = $("dashboardMessage");

async function requireAdmin() {
  if (!window.supabaseConfigured) { alert("Konfigurasi Supabase belum diisi. Periksa js/config.js."); location.href = "login.html"; return false; }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.href = "login.html"; return false; }
  const { data: profile, error } = await sb.from("profiles").select("role").eq("id", session.user.id).single();
  if (error || profile?.role !== "admin") { await sb.auth.signOut(); location.href = "login.html"; return false; }
  $("adminEmail").textContent = session.user.email || "Administrator";
  return true;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
async function loadStudents() {
  message.textContent = "Memuat data...";
  const { data, error } = await sb.from("students").select("*").order("full_name");
  if (error) { message.textContent = "Gagal memuat data: " + error.message; return; }
  students = data || [];
  $("totalStudents").textContent = students.length;
  $("activeStudents").textContent = students.filter(s => s.status === "Aktif").length;
  $("maleStudents").textContent = students.filter(s => s.gender === "Putra").length;
  $("femaleStudents").textContent = students.filter(s => s.gender === "Putri").length;
  renderRows();
  message.textContent = "";
}
function renderRows() {
  const q = $("searchInput").value.toLowerCase().trim();
  const filtered = students.filter(s => [s.nis,s.full_name,s.class_name].some(v => String(v || "").toLowerCase().includes(q)));
  $("studentRows").innerHTML = filtered.length ? filtered.map(s => `<tr>
    <td>${escapeHTML(s.nis)}</td><td>${escapeHTML(s.full_name)}</td><td>${escapeHTML(s.gender)}</td>
    <td>${escapeHTML(s.class_name || "-")}</td><td>${escapeHTML(s.status)}</td>
    <td><button class="table-action" data-edit="${s.id}">Edit</button><button class="table-action delete" data-delete="${s.id}">Hapus</button></td>
  </tr>`).join("") : '<tr><td colspan="6">Tidak ada data yang cocok.</td></tr>';
}
function resetForm() { $("studentForm").reset(); $("studentId").value = ""; $("dialogTitle").textContent = "Tambah Santri"; $("formMessage").textContent = ""; }
function openAdd() { resetForm(); dialog.showModal(); }
function openEdit(s) {
  resetForm(); $("dialogTitle").textContent = "Edit Data Santri"; $("studentId").value = s.id;
  $("nis").value=s.nis||""; $("fullName").value=s.full_name||""; $("gender").value=s.gender||"";
  $("className").value=s.class_name||""; $("birthPlace").value=s.birth_place||""; $("birthDate").value=s.birth_date||"";
  $("entryYear").value=s.entry_year||""; $("status").value=s.status||"Aktif"; $("address").value=s.address||"";
  $("guardianName").value=s.guardian_name||""; $("guardianPhone").value=s.guardian_phone||"";
  dialog.showModal();
}
$("studentRows").addEventListener("click", async e => {
  const editId = e.target.dataset.edit, deleteId = e.target.dataset.delete;
  if (editId) { const s = students.find(x => x.id === editId); if (s) openEdit(s); }
  if (deleteId) {
    const s = students.find(x => x.id === deleteId);
    if (!s || !confirm(`Hapus data santri ${s.full_name}? Tindakan ini tidak dapat dibatalkan.`)) return;
    const { error } = await sb.from("students").delete().eq("id", deleteId);
    if (error) alert("Gagal menghapus: " + error.message); else await loadStudents();
  }
});
$("studentForm").addEventListener("submit", async e => {
  e.preventDefault(); $("formMessage").textContent = "Menyimpan...";
  const id = $("studentId").value;
  const payload = {
    nis:$("nis").value.trim(), full_name:$("fullName").value.trim(), gender:$("gender").value,
    class_name:$("className").value.trim() || null, birth_place:$("birthPlace").value.trim() || null,
    birth_date:$("birthDate").value || null, entry_year:$("entryYear").value ? Number($("entryYear").value) : null,
    status:$("status").value, address:$("address").value.trim() || null,
    guardian_name:$("guardianName").value.trim() || null, guardian_phone:$("guardianPhone").value.trim() || null
  };
  const result = id ? await sb.from("students").update(payload).eq("id", id) : await sb.from("students").insert(payload);
  if (result.error) { $("formMessage").textContent = "Gagal menyimpan: " + result.error.message; return; }
  dialog.close(); resetForm(); await loadStudents();
});
$("addStudentButton").addEventListener("click", openAdd);
$("closeDialog").addEventListener("click", () => dialog.close());
$("cancelButton").addEventListener("click", () => dialog.close());
$("searchInput").addEventListener("input", renderRows);
$("exportButton").addEventListener("click", () => {
  const headers = ["NIS","Nama","Jenis Kelamin","Kelas","Status","Tempat Lahir","Tanggal Lahir","Tahun Masuk","Alamat","Nama Wali","Kontak Wali"];
  const keys = ["nis","full_name","gender","class_name","status","birth_place","birth_date","entry_year","address","guardian_name","guardian_phone"];
  const csv = [headers, ...students.map(s => keys.map(k => s[k] ?? ""))].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="data-santri.csv"; a.click(); URL.revokeObjectURL(url);
});
$("logoutButton").addEventListener("click", async () => { await sb.auth.signOut(); location.href = "login.html"; });
(async () => { if (await requireAdmin()) await loadStudents(); })();
