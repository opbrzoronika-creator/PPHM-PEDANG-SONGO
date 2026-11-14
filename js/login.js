const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  if (!window.supabaseConfigured) {
    message.textContent = "Konfigurasi Supabase belum diisi. Periksa js/config.js.";
    return;
  }
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { message.textContent = "Login gagal: " + error.message; return; }
  const { data: profile, error: profileError } = await sb.from("profiles").select("role").eq("id", data.user.id).single();
  if (profileError || profile?.role !== "admin") {
    await sb.auth.signOut();
    message.textContent = "Akun ini tidak memiliki akses administrator.";
    return;
  }
  window.location.href = "index.html";
});
