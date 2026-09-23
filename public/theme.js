// Applies the stored theme before the page paints. Loaded from the document
// head by app/layout.tsx; keep it tiny and synchronous.
(function () {
  try {
    var t = localStorage.getItem("theme");
    document.documentElement.dataset.theme = t === "dark" ? "dark" : "light";
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();
