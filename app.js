document.getElementById("colorBtn").addEventListener("click", function() {
  const colors = ["#f5f5f5", "#000000", "#ffe0e0", "#e0ffe0", "#e0e0ff", "#ffffe0"];
  document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
});
