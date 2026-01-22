document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("messagesContainer");
  const emptyState = document.getElementById("emptyState");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");
  const refreshBtn = document.getElementById("refreshBtn");

  let allMessages = [];

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || "";
    }
  }

  function badgeClass(status) {
    if (status === "new") return "badge new";
    if (status === "read") return "badge read";
    return "badge resolved";
  }

  function nextStatus(current) {
    if (current === "new") return "read";
    if (current === "read") return "resolved";
    return "new";
  }

  async function loadMessages() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    allMessages = Array.isArray(data) ? data : [];
    render();
  }

  function matchesFilter(msg) {
    const f = statusFilter.value;
    if (f !== "all" && msg.status !== f) return false;

    const q = searchInput.value.trim().toLowerCase();
    if (!q) return true;

    const hay = `${msg.fullName} ${msg.email} ${msg.reason} ${msg.topic} ${msg.details}`.toLowerCase();
    return hay.includes(q);
  }

  function render() {
    const filtered = allMessages.filter(matchesFilter);

    container.innerHTML = "";
    emptyState.hidden = filtered.length !== 0;

    filtered.forEach((m) => {
      const card = document.createElement("article");
      card.className = "msg-card";

      card.innerHTML = `
        <header class="msg-top">
          <div class="msg-title">
            <h3>${escapeHtml(m.fullName || "Unknown")}</h3>
            <p class="msg-email">${escapeHtml(m.email || "")}</p>
          </div>
          <span class="${badgeClass(m.status)}">${escapeHtml(m.status)}</span>
        </header>

        <div class="msg-meta">
          <p><span>Reason:</span> ${escapeHtml(m.reason || "")}</p>
          <p><span>Topic:</span> ${escapeHtml(m.topic || "")}</p>
          <p><span>Date:</span> ${escapeHtml(formatDate(m.createdAt))}</p>
        </div>

        <details class="msg-details">
          <summary>View message</summary>
          <p>${escapeHtml(m.details || "")}</p>
        </details>

        <div class="msg-actions">
          <button class="admin-btn outline" data-action="toggle" data-id="${m.id}" data-next="${nextStatus(m.status)}">
            Mark as ${escapeHtml(nextStatus(m.status))}
          </button>
          <button class="admin-btn danger" data-action="delete" data-id="${m.id}">
            Delete
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === "delete") {
      const ok = confirm("Delete this message?");
      if (!ok) return;

      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Delete failed.");
        return;
      }
      await loadMessages();
      return;
    }

    if (action === "toggle") {
      const next = btn.dataset.next;

      const res = await fetch(`/api/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });

      if (!res.ok) {
        alert("Update failed.");
        return;
      }
      await loadMessages();
      return;
    }
  });

  statusFilter.addEventListener("change", render);
  searchInput.addEventListener("input", render);
  refreshBtn.addEventListener("click", loadMessages);

  loadMessages().catch(() => {
    alert("Could not load messages. Is the server running?");
  });
});
