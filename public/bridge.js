/*
 * Radvisor Atlas — report bridge.
 * Loaded by each report HTML via:  <script src="/bridge.js"></script>
 *
 * What it does:
 *   1. Reads ?locale= and ?patient= from the iframe URL.
 *   2. Exposes window.__RADVISOR__ = { locale, patient, labels }.
 *   3. Renders a **print-only** Radvisor-branded header + patient grid at the
 *      top of the report body (invisible on screen, visible only when the
 *      user prints / saves as PDF).
 *   4. Applies [data-i18n-{locale}] attributes to element.textContent.
 *   5. Applies [data-i18n-{locale}-{attr}] to the matching attribute
 *      (placeholder, title, aria-label, value, alt).
 *   6. Watches the DOM for new nodes (React re-renders) and re-applies i18n.
 *   7. Dispatches a "radvisor:ready" CustomEvent when the first pass is done.
 */
(function () {
  "use strict";

  // -------- URL params ----------------------------------------------------

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
      tagline: "Innovative Radiology",
      genderLong: { MALE: "Erkek", FEMALE: "Kadın", OTHER: "Diğer" },
      patientType: {
        POLICLINIC: "Poliklinik",
        SERVICE: "Servis",
        EMERGENCY: "Acil",
        INTENSIVE_CARE: "Yoğun Bakım",
        CONSULTATION: "Konsültasyon",
      },
      fieldLabels: {
        patientName: "Hasta Adı",
        patientSurname: "Soyadı",
        gender: "Cinsiyet",
        patientType: "Hasta Türü",
        modality: "Modalite",
        assignedDoctor: "Sorumlu Doktor",
        approvingDoctor: "Onaylayan Doktor",
      },
    },
    en: {
      tagline: "Innovative Radiology",
      genderLong: { MALE: "Male", FEMALE: "Female", OTHER: "Other" },
      patientType: {
        POLICLINIC: "Outpatient",
        SERVICE: "Inpatient",
        EMERGENCY: "Emergency",
        INTENSIVE_CARE: "Intensive Care",
        CONSULTATION: "Consultation",
      },
      fieldLabels: {
        patientName: "First Name",
        patientSurname: "Last Name",
        gender: "Gender",
        patientType: "Patient Type",
        modality: "Modality",
        assignedDoctor: "Assigned Doctor",
        approvingDoctor: "Approving Doctor",
      },
    },
  };
  var LOC = L[locale] || L.tr;

  window.__RADVISOR__ = {
    locale: locale,
    patient: patient,
    labels: LOC,
  };

  var LOGO_URL = "/brand/logo.png";

  // -------- Styles (print-only Radvisor header) --------------------------

  var STYLE = [
    // Hidden on screen
    "[data-radvisor-print-header],",
    "[data-radvisor-print-header-default]{",
    "  display:none !important;",
    "}",
    // Visible only in print
    "@media print{",
    "  [data-radvisor-print-header],",
    "  [data-radvisor-print-header-default]{",
    "    display:block !important;",
    "    margin:0 0 20px;",
    "    color:#1f2937;",
    "    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
    "    -webkit-print-color-adjust:exact !important;",
    "    print-color-adjust:exact !important;",
    "    page-break-inside:avoid;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-top,",
    "  [data-radvisor-print-header-default] .rv-print-top{",
    "    display:flex;",
    "    align-items:center;",
    "    justify-content:space-between;",
    "    margin-bottom:14px;",
    "    gap:24px;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-logo,",
    "  [data-radvisor-print-header-default] .rv-print-logo{",
    "    width:70px;",
    "    height:70px;",
    "    object-fit:contain;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-brand,",
    "  [data-radvisor-print-header-default] .rv-print-brand{",
    "    text-align:right;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-title,",
    "  [data-radvisor-print-header-default] .rv-print-title{",
    "    font-size:20px;",
    "    font-weight:700;",
    "    color:#da291c !important;",
    "    letter-spacing:1px;",
    "    margin:0;",
    "    line-height:1.1;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-description,",
    "  [data-radvisor-print-header-default] .rv-print-description{",
    "    font-size:13px;",
    "    color:#53565a !important;",
    "    margin:3px 0 0;",
    "    line-height:1.2;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-grid,",
    "  [data-radvisor-print-header-default] .rv-print-grid{",
    "    display:grid;",
    "    grid-template-columns:1fr 1fr;",
    "    gap:6px 24px;",
    "    padding:12px 0;",
    "    border-top:1px solid #c9cdd3;",
    "    border-bottom:1px solid #c9cdd3;",
    "    font-size:12px;",
    "    line-height:1.5;",
    "  }",
    "  [data-radvisor-print-header] .rv-print-grid .rv-k,",
    "  [data-radvisor-print-header-default] .rv-print-grid .rv-k{",
    "    font-weight:700;",
    "    color:#111827;",
    "  }",
    "}",
  ].join("\n");

  function injectStylesOnce() {
    if (document.getElementById("radvisor-atlas-style")) return;
    var s = document.createElement("style");
    s.id = "radvisor-atlas-style";
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  // -------- Print header (logo + brand + patient grid) -------------------

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

  function buildPrintHeaderMarkup() {
    var rows = [];
    if (patient) {
      if (patient.patientName) {
        rows.push([LOC.fieldLabels.patientName, patient.patientName]);
      }
      if (patient.patientSurname) {
        rows.push([LOC.fieldLabels.patientSurname, patient.patientSurname]);
      }
      if (patient.gender && LOC.genderLong[patient.gender]) {
        rows.push([LOC.fieldLabels.gender, LOC.genderLong[patient.gender]]);
      }
      if (patient.patientType && LOC.patientType[patient.patientType]) {
        rows.push([
          LOC.fieldLabels.patientType,
          LOC.patientType[patient.patientType],
        ]);
      }
      if (patient.modality) {
        rows.push([LOC.fieldLabels.modality, patient.modality]);
      }
      if (patient.assignedDoctor) {
        rows.push([LOC.fieldLabels.assignedDoctor, patient.assignedDoctor]);
      }
      if (patient.approvingDoctor) {
        rows.push([LOC.fieldLabels.approvingDoctor, patient.approvingDoctor]);
      }
    }

    var gridHtml = "";
    if (rows.length) {
      var cells = rows
        .map(function (r) {
          return (
            '<div><span class="rv-k">' +
            escapeHtml(r[0]) +
            ":</span> " +
            escapeHtml(r[1]) +
            "</div>"
          );
        })
        .join("");
      gridHtml = '<div class="rv-print-grid">' + cells + "</div>";
    }

    return (
      '<div class="rv-print-top">' +
      '<img class="rv-print-logo" src="' +
      LOGO_URL +
      '" alt="" />' +
      '<div class="rv-print-brand">' +
      '<div class="rv-print-title">RADVISOR</div>' +
      '<div class="rv-print-description">' +
      escapeHtml(LOC.tagline) +
      "</div>" +
      "</div>" +
      "</div>" +
      gridHtml
    );
  }

  function renderPrintHeader() {
    var markup = buildPrintHeaderMarkup();
    // Author-provided slot takes precedence
    var slot = document.querySelector("[data-radvisor-print-header]");
    if (slot) {
      slot.innerHTML = markup;
      slot.setAttribute("data-radvisor-filled", "true");
      return;
    }
    if (!document.body) return;
    var div = document.createElement("div");
    div.setAttribute("data-radvisor-print-header-default", "true");
    div.innerHTML = markup;
    document.body.insertBefore(div, document.body.firstChild);
  }

  // -------- i18n apply (attribute-driven, explicit only) -----------------

  var ATTR_TARGETS = ["placeholder", "title", "aria-label", "value", "alt"];
  var APPLIED_FLAG = "data-radvisor-i18n-" + locale;

  function applyI18n(root) {
    var scope = root || document.body || document;
    if (!scope) return 0;

    var applied = 0;

    var textAttr = "data-i18n-" + locale;
    var textSel = "[" + textAttr + "]:not([" + APPLIED_FLAG + "-text])";
    var textNodes = scope.querySelectorAll
      ? scope.querySelectorAll(textSel)
      : [];
    for (var i = 0; i < textNodes.length; i++) {
      var el = textNodes[i];
      var v = el.getAttribute(textAttr);
      if (v == null) continue;
      el.textContent = v;
      el.setAttribute(APPLIED_FLAG + "-text", "1");
      applied++;
    }

    for (var a = 0; a < ATTR_TARGETS.length; a++) {
      var attrName = ATTR_TARGETS[a];
      var dataAttr = "data-i18n-" + locale + "-" + attrName;
      var appliedAttr = APPLIED_FLAG + "-attr-" + attrName;
      var sel = "[" + dataAttr + "]:not([" + appliedAttr + "])";
      var nodes = scope.querySelectorAll ? scope.querySelectorAll(sel) : [];
      for (var j = 0; j < nodes.length; j++) {
        var el2 = nodes[j];
        var val = el2.getAttribute(dataAttr);
        if (val == null) continue;
        el2.setAttribute(attrName, val);
        el2.setAttribute(appliedAttr, "1");
        applied++;
      }
    }

    return applied;
  }

  // -------- MutationObserver (for React re-renders) -----------------------

  var pending = null;
  function schedule() {
    if (pending) return;
    pending = (window.requestAnimationFrame || window.setTimeout)(function () {
      pending = null;
      try {
        applyI18n();
      } catch (_) {}
    }, 1);
  }

  function startObserver() {
    if (!window.MutationObserver || !document.body) return;
    var mo = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type !== "childList") continue;
        if (!m.addedNodes || !m.addedNodes.length) continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (!node || node.nodeType !== 1) continue;
          schedule();
          return;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  // -------- Boot ----------------------------------------------------------

  function run() {
    try {
      injectStylesOnce();
      renderPrintHeader();
      applyI18n();
      startObserver();
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
