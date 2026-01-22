const items = document.querySelectorAll(".value-item");
let current = 0;
let interval;

function activateItem(index) {
  items.forEach((item, i) => {
    item.classList.toggle("active", i === index);
    item.querySelector(".progress span").style.width = "0%";
  });

  const bar = items[index].querySelector(".progress span");
  let width = 0;

  clearInterval(interval);
  interval = setInterval(() => {
    width += 1;
    bar.style.width = width + "%";

    if (width >= 100) {
      clearInterval(interval);
      current = (index + 1) % items.length;
      activateItem(current);
    }
  }, 30);
}

// click support
items.forEach((item, i) => {
  item.addEventListener("click", () => {
    current = i;
    activateItem(i);
  });
});

activateItem(0);
