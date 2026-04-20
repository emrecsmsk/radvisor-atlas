/*
 * Radvisor Atlas — rapor köprüsü / report bridge
 * Her report.html'in <head> sonuna <script src="/bridge.js"></script> eklenir.
 *
 * Görevler:
 *   - URL parametresinden `locale` ve `patient` bilgisini okur
 *   - window.__RADVISOR__ olarak sunar
 *   - Sayfaya tek tip bir hasta şeridi ekler (print-safe)
 *   - [data-i18n-tr] / [data-i18n-en] attribute'lerini aktif dile göre uygular
 *   - EN seçili ama raporun hiçbir yerinde data-i18n-en yoksa nötr bir uyarı şeridi gösterir
 *   - `radvisor:ready` event'ini yayar
 */
(function () {
  "use strict";

  function parsePatient(raw) {
    if (!raw) return null;
    var decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch (_) {}
    try {
      return JSON.parse(decoded);
    } catch (_) {
      try {
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }
  }

  var qs = new URLSearchParams(location.search);
  var locale = qs.get("locale") || "tr";
  var patient = parsePatient(qs.get("patient"));

  var L = {
    tr: {
      genderShort: { MALE: "E", FEMALE: "K", OTHER: "D" },
      genderLong: { MALE: "Erkek", FEMALE: "Kadın", OTHER: "Diğer" },
      patientType: {
        POLICLINIC: "Poliklinik",
        SERVICE: "Servis",
        EMERGENCY: "Acil",
        INTENSIVE_CARE: "Yoğun Bakım",
        CONSULTATION: "Konsültasyon",
      },
      labels: {
        patient: "Hasta",
        modality: "Modalite",
        assignedDoctor: "Sorumlu Dr.",
        approvingDoctor: "Onaylayan Dr.",
      },
      notice:
        "Bu rapor yalnızca Türkçe içerik barındırıyor. Arayüz dili İngilizce, rapor içeriği Türkçe olarak görünmeye devam edecek.",
    },
    en: {
      genderShort: { MALE: "M", FEMALE: "F", OTHER: "O" },
      genderLong: { MALE: "Male", FEMALE: "Female", OTHER: "Other" },
      patientType: {
        POLICLINIC: "Outpatient",
        SERVICE: "Inpatient",
        EMERGENCY: "Emergency",
        INTENSIVE_CARE: "Intensive Care",
        CONSULTATION: "Consultation",
      },
      labels: {
        patient: "Patient",
        modality: "Modality",
        assignedDoctor: "Assigned Dr.",
        approvingDoctor: "Approving Dr.",
      },
      notice:
        "This report is only available in Turkish. Only the surrounding interface is in English.",
    },
  };
  var LOC = L[locale] || L.tr;

  window.__RADVISOR__ = {
    locale: locale,
    patient: patient,
    labels: LOC,
  };

  // ---- Styles injected once ----------------------------------------------

  var STYLE = [
    "[data-radvisor-root]{",
    "  font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
    "  color:#1f2937;",
    "  -webkit-print-color-adjust:exact;",
    "  print-color-adjust:exact;",
    "}",
    "[data-radvisor-patient-bar],[data-radvisor-patient-bar-default]{",
    "  display:flex;flex-wrap:wrap;gap:4px 14px;",
    "  padding:10px 20px;",
    "  background:#f3f5f9;border-bottom:1px solid #dee3ec;",
    "  color:#1f2937;font-weight:400;",
    "  -webkit-print-color-adjust:exact;print-color-adjust:exact;",
    "}",
    "[data-radvisor-patient-bar] .rv-name,[data-radvisor-patient-bar-default] .rv-name{",
    "  font-weight:600;color:#0f172a;",
    "}",
    "[data-radvisor-patient-bar] .rv-dot,[data-radvisor-patient-bar-default] .rv-dot{",
    "  color:#9aa3b2;",
    "}",
    "[data-radvisor-patient-bar] .rv-k,[data-radvisor-patient-bar-default] .rv-k{",
    "  color:#6b7280;",
    "}",
    "[data-radvisor-locale-notice]{",
    "  padding:6px 20px;",
    "  background:#fff7e6;border-bottom:1px solid #f3e4c1;",
    "  color:#7a5a1e;font:12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;",
    "  -webkit-print-color-adjust:exact;print-color-adjust:exact;",
    "}",
    "@media print{",
    "  [data-radvisor-locale-notice]{display:none;}",
    "}",
  ].join("\n");

  function injectStylesOnce() {
    if (document.getElementById("radvisor-atlas-style")) return;
    var s = document.createElement("style");
    s.id = "radvisor-atlas-style";
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  // ---- Patient bar --------------------------------------------------------

  function buildPatientMarkup() {
    if (!patient) return "";
    var parts = [];
    var name =
      (patient.patientName || "") + " " + (patient.patientSurname || "");
    name = name.trim();
    parts.push('<span class="rv-name">' + escapeHtml(name) + "</span>");

    if (patient.gender && LOC.genderLong[patient.gender]) {
      parts.push(
        '<span class="rv-dot">·</span><span><span class="rv-k">' +
          escapeHtml(LOC.labels.patient) +
          ":</span> " +
          escapeHtml(LOC.genderLong[patient.gender]) +
          "</span>",
      );
    }
    if (patient.patientType && LOC.patientType[patient.patientType]) {
      parts.push(
        '<span class="rv-dot">·</span><span>' +
          escapeHtml(LOC.patientType[patient.patientType]) +
          "</span>",
      );
    }
    if (patient.modality) {
      parts.push(
        '<span class="rv-dot">·</span><span><span class="rv-k">' +
          escapeHtml(LOC.labels.modality) +
          ":</span> " +
          escapeHtml(patient.modality) +
          "</span>",
      );
    }
    if (patient.assignedDoctor) {
      parts.push(
        '<span class="rv-dot">·</span><span><span class="rv-k">' +
          escapeHtml(LOC.labels.assignedDoctor) +
          "</span> " +
          escapeHtml(patient.assignedDoctor) +
          "</span>",
      );
    }
    if (patient.approvingDoctor) {
      parts.push(
        '<span class="rv-dot">·</span><span><span class="rv-k">' +
          escapeHtml(LOC.labels.approvingDoctor) +
          "</span> " +
          escapeHtml(patient.approvingDoctor) +
          "</span>",
      );
    }
    return parts.join("");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  function renderPatientBar() {
    if (!patient) return;
    var markup = buildPatientMarkup();
    if (!markup) return;

    document.documentElement.setAttribute("data-radvisor-root", "true");

    var slot = document.querySelector("[data-radvisor-patient-bar]");
    if (slot) {
      slot.innerHTML = markup;
      slot.setAttribute("data-radvisor-filled", "true");
      return;
    }
    if (!document.body) return;
    var bar = document.createElement("div");
    bar.setAttribute("data-radvisor-patient-bar-default", "true");
    bar.innerHTML = markup;
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ---- Inline i18n translations ------------------------------------------

  function applyInlineTranslations() {
    var attr = "data-i18n-" + locale;
    var nodes = document.querySelectorAll("[" + attr + "]");
    for (var i = 0; i < nodes.length; i++) {
      var v = nodes[i].getAttribute(attr);
      if (v != null) nodes[i].textContent = v;
    }
    return nodes.length;
  }

  // ---- Locale mismatch notice --------------------------------------------

  function maybeShowLocaleNotice(translated) {
    if (locale === "tr") return;
    // Only show if EN selected but report offers nothing in EN
    var anyEn = document.querySelector("[data-i18n-en]");
    if (anyEn) return;
    if (!document.body) return;

    var notice = document.createElement("div");
    notice.setAttribute("data-radvisor-locale-notice", "true");
    notice.textContent = LOC.notice;
    // Place right after the patient bar, else at the very top
    var existingBar =
      document.querySelector("[data-radvisor-patient-bar-default]") ||
      document.querySelector(
        "[data-radvisor-patient-bar][data-radvisor-filled]",
      );
    if (existingBar && existingBar.parentNode === document.body) {
      existingBar.parentNode.insertBefore(notice, existingBar.nextSibling);
    } else {
      document.body.insertBefore(notice, document.body.firstChild);
    }
  }

  // ---- Boot --------------------------------------------------------------

  function run() {
    try {
      injectStylesOnce();
      renderPatientBar();
      var translated = applyInlineTranslations();
      maybeShowLocaleNotice(translated);
    } catch (e) {
      if (window.console && window.console.warn) {
        window.console.warn("[radvisor-bridge]", e);
      }
    }
    try {
      window.dispatchEvent(
        new CustomEvent("radvisor:ready", {
          detail: { locale: locale, patient: patient },
        }),
      );
    } catch (_) {
      var ev = document.createEvent("Event");
      ev.initEvent("radvisor:ready", false, false);
      window.dispatchEvent(ev);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
