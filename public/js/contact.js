document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = form.querySelector('input[name="fullName"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const reason = form.querySelector('input[name="reason"]').value.trim();
    const topic = form.querySelector('input[name="topic"]').value.trim();
    const details = form.querySelector('textarea[name="details"]').value.trim();

    // Basit frontend doğrulama
    if (!fullName || !email || !reason || !topic || !details) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, reason, topic, details })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Something went wrong.");
        return;
      }

      alert("Thanks! Your message has been sent.");
      form.reset();
    } catch (err) {
      alert("Server error. Please try again.");
    }
  });
});
