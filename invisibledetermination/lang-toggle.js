(function () {
  const en = document.querySelector('[data-lang="en"]');
  const zh = document.querySelector('[data-lang="zh"]');
  const btn = document.getElementById("langBtn");

  if (!en || !zh || !btn) return;

  function setLang(lang) {
    const isZh = lang === "zh";
    en.classList.toggle("active", !isZh);
    zh.classList.toggle("active", isZh);

    btn.textContent = isZh ? "English" : "中文";
    document.documentElement.lang = isZh ? "zh-Hant" : "en";

    try {
      localStorage.setItem("prefLang", isZh ? "zh" : "en");
    } catch (e) {}
  }

  let initial = "en";
  try {
    const saved = localStorage.getItem("prefLang");
    if (saved === "zh" || saved === "en") initial = saved;
  } catch (e) {}

  if (initial === "en") {
    const navLang = (navigator.language || "").toLowerCase();
    if (navLang.startsWith("zh")) initial = "zh";
  }

  setLang(initial);

  btn.addEventListener("click", function () {
    const currentIsZh = zh.classList.contains("active");
    setLang(currentIsZh ? "en" : "zh");
  });
})();
