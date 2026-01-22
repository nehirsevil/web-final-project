document.addEventListener("DOMContentLoaded", () => {

  const title = document.getElementById("intentionalTitle");
  const text = document.getElementById("intentionalText");
  const section = document.querySelector(".intentional-section");

  if (!title || !text || !section) return;

  window.addEventListener("scroll", () => {
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = 1 - rect.top / windowHeight;
      const scale = Math.min(Math.max(progress, 0.85), 1.1);

      title.style.transform = `scale(${scale})`;
      text.style.transform = `scale(${scale})`;
    }
  });

});
