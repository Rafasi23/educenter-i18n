// i18n.js — versão estável
// - Idioma por defeito: EN
// - Suporta data-i18n (conteúdo) e data-i18n-attr (atributos, ex.: placeholder:title:key)
// - Persiste escolha no localStorage e atualiza <html lang="..">

const DEFAULT_LANG = "en";
const SUPPORTED = ["en", "pt", "es"];

const saved = localStorage.getItem("lang");
const navLang = (navigator.language || "").slice(0, 2);
let lang = SUPPORTED.includes(saved) ? saved : (SUPPORTED.includes(navLang) ? navLang : DEFAULT_LANG);

function ready(fn){ document.readyState !== "loading" ? fn() : document.addEventListener("DOMContentLoaded", fn); }

ready(() => {
  const select = document.getElementById("lang");
  if (select) {
    // garante que o valor existe no dropdown
    if (!Array.from(select.options).some(o => o.value === lang)) lang = DEFAULT_LANG;
    select.value = lang;
    select.addEventListener("change", (e) => {
      lang = e.target.value;
      localStorage.setItem("lang", lang);
      applyLang(lang);
    });
  }
  applyLang(lang);
});

async function applyLang(code) {
  const url = `assets/i18n/${code}.json`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const dict = await res.json();

    document.documentElement.setAttribute("lang", code);

    // Conteúdo: data-i18n="a.b.c"
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = get(dict, key);
      if (text == null) return; // mantém fallback
      if (el.tagName === "TITLE") document.title = text;
      else el.innerHTML = text;
    });

    // Atributos: data-i18n-attr="placeholder:contact.form.name;title:hero.general.title"
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const pairs = el.getAttribute("data-i18n-attr").split(";").map(s => s.trim()).filter(Boolean);
      pairs.forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const val = get(dict, key);
        if (attr && val != null) el.setAttribute(attr, val);
      });
    });
  } catch (e) {
    console.error("[i18n] load error:", e);
  }
}

function get(obj, path) {
  return path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), obj);
}

