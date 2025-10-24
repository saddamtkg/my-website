const btn = document.getElementById("colorBtn");
const statusText = document.getElementById("statusText");

btn.addEventListener("click", () => {
  const colors = ["#f0f8ff", "#ffe4e1", "#e6ffe6", "#fff0f5", "#f5fffa"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  document.body.style.backgroundColor = randomColor;
  statusText.textContent = `Background changed to: ${randomColor}`;
});
