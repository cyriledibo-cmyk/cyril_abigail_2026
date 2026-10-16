const API_URL = window.WEDDING_API_URL || "http://localhost:8000/api";

document.querySelector("#menuToggle").addEventListener("click", () => {
  document.querySelector("#navLinks").classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(a => {
  a.addEventListener("click", () => document.querySelector("#navLinks").classList.remove("open"));
});

const weddingDate = new Date("2026-10-17T09:00:00+03:00");
function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  const el = document.querySelector("#countdown");
  if (diff <= 0) { el.innerHTML = "<div><strong>Today</strong><small>Our Wedding Day</small></div>"; return; }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  el.innerHTML = `
    <div><strong>${d}</strong><small>Days</small></div>
    <div><strong>${h}</strong><small>Hours</small></div>
    <div><strong>${m}</strong><small>Minutes</small></div>
    <div><strong>${s}</strong><small>Seconds</small></div>`;
}
updateCountdown(); setInterval(updateCountdown,1000);

async function sendForm(form, endpoint, statusId) {
  const status = document.querySelector(statusId);
  status.textContent = "Sending...";
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Request failed");
    status.textContent = result.message || "Thank you!";
    form.reset();
    if(endpoint === "/messages") loadMessages();
  } catch(err) {
    status.textContent = `Could not send: ${err.message}`;
  }
}

document.querySelector("#rsvpForm").addEventListener("submit", e => {
  e.preventDefault(); sendForm(e.target,"/rsvps","#rsvpStatus");
});
document.querySelector("#messageForm").addEventListener("submit", e => {
  e.preventDefault(); sendForm(e.target,"/messages","#messageStatus");
});

async function loadMessages() {
  const list = document.querySelector("#messagesList");
  try {
    const response = await fetch(`${API_URL}/messages`);
    const messages = await response.json();
    list.innerHTML = messages.map(m => `
      <article class="message">
        <strong>${escapeHtml(m.name)}</strong>
        <p>${escapeHtml(m.message)}</p>
      </article>`).join("");
  } catch { list.innerHTML = "<p>Messages will appear here.</p>"; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
loadMessages();
