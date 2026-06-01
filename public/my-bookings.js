function rowHtml(b) {
  const status = b.status || "confirmed";
  return `
    <li class="booking-row">
      <div class="booking-row-main">
        <strong>${escapeHtml(b.restaurant || "Restaurant")}</strong>
        <span class="booking-row-meta">${escapeHtml(b.date)} · ${b.partySize} guests · ${escapeHtml(b.floor || "—")}</span>
      </div>
      <span class="booking-status booking-status--${status}">${escapeHtml(status)}</span>
    </li>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function initMyBookings() {
  const errEl = document.getElementById("bookings-error");
  const userEl = document.getElementById("bookings-user");
  const currentList = document.getElementById("current-bookings");
  const pastList = document.getElementById("past-bookings");
  const emptyCurrent = document.getElementById("empty-current");
  const emptyPast = document.getElementById("empty-past");

  const meRes = await fetch("/api/auth/me", { credentials: "include" });
  if (!meRes.ok) {
    window.location.href = "signin.html";
    return;
  }
  const me = await meRes.json();
  if (userEl) {
    userEl.textContent = me.user?.email || "";
  }

  const res = await fetch("/api/bookings/mine", { credentials: "include" });
  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "signin.html";
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (errEl) {
      errEl.textContent = body.message || "Could not load bookings.";
      errEl.classList.remove("hidden");
    }
    return;
  }

  const data = await res.json();
  const todayNote = document.getElementById("bookings-today-note");
  if (todayNote) {
    todayNote.textContent = `Today (${data.today}, server local date): upcoming bookings use this date for “current”.`;
  }

  if (data.current?.length) {
    emptyCurrent?.classList.add("hidden");
    currentList.innerHTML = data.current.map(rowHtml).join("");
  } else {
    emptyCurrent?.classList.remove("hidden");
    currentList.innerHTML = "";
  }

  if (data.past?.length) {
    emptyPast?.classList.add("hidden");
    pastList.innerHTML = data.past.map(rowHtml).join("");
  } else {
    emptyPast?.classList.remove("hidden");
    pastList.innerHTML = "";
  }
}

window.addEventListener("DOMContentLoaded", initMyBookings);
