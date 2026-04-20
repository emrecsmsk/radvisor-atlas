/*
 * Radvisor Atlas — report bridge.
 * Loaded by each report HTML via:  <script src="/bridge.js"></script>
 *
 * What it does:
 *   1. Reads ?locale= and ?patient= from the iframe URL.
 *   2. Exposes window.__RADVISOR__ = { locale, patient, labels }.
 *   3. Renders a print-safe patient strip at the top of the report body.
 *   4. Applies [data-i18n-{locale}] attributes to element.textContent.
 *   5. Applies [data-i18n-{locale}-{attr}] to the matching attribute
 *      (placeholder, title, aria-label, value, alt).
 *   6. Watches the DOM for new nodes (React re-renders) and re-applies i18n.
 *   7. Dispatches a "radvisor:ready" CustomEvent when the first pass is done.
 *
 * Design rule: the bridge NEVER translates plain text with a dictionary —
 * translation is always explicit via data-i18n-* attributes authored in the
 * report HTML (or via window.__RADVISOR__.locale inside the report's own JS).
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
      genderLong: { MALE: "Erkek", FEMALE: "Kadın", OTHER: "Diğer" },
      patientType: {
        POLICLINIC: "Poliklinik",
        SERVICE: "Servis",
        EMERGENCY: "Acil",
        INTENSIVE_CARE: "Yoğun Bakım",
        CONSULTATION: "Konsültasyon",
      },
      labels: {
        modality: "Modalite",
        assignedDoctor: "Sorumlu Dr.",
        approvingDoctor: "Onaylayan Dr.",
      },
    },
    en: {
      genderLong: { MALE: "Male", FEMALE: "Female", OTHER: "Other" },
      patientType: {
        POLICLINIC: "Outpatient",
        SERVICE: "Inpatient",
        EMERGENCY: "Emergency",
        INTENSIVE_CARE: "Intensive Care",
        CONSULTATION: "Consultation",
      },
      labels: {
        modality: "Modality",
        assignedDoctor: "Assigned Dr.",
        approvingDoctor: "Approving Dr.",
      },
    },
  };
  var LOC = L[locale] || L.tr;

  window.__RADVISOR__ = {
    locale: locale,
    patient: patient,
    labels: LOC,
  };

  // -------- Styles (patient bar) -----------------------------------------

  var STYLE = [
    "[data-radvisor-patient-bar],[data-radvisor-patient-bar-default]{",
    "  display:flex;flex-wrap:wrap;gap:4px 14px;",
    "  padding:10px 20px;",
    "  background:#f3f5f9;border-bottom:1px solid #dee3ec;",
    "  color:#1f2937;font-weight:400;",
    "  font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
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
  ].join("\n");

  function injectStylesOnce() {
    if (document.getElementById("radvisor-atlas-style")) return;
    var s = document.createElement("style");
    s.id = "radvisor-atlas-style";
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  // -------- Patient strip -------------------------------------------------

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

  function buildPatientMarkup() {
    if (!patient) return "";
    var parts = [];
    var name = (
      (patient.patientName || "") +
      " " +
      (patient.patientSurname || "")
    ).trim();
    parts.push('<span class="rv-name">' + escapeHtml(name) + "</span>");
    if (patient.gender && LOC.genderLong[patient.gender]) {
      parts.push(
        '<span class="rv-dot">·</span><span>' +
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

  function renderPatientBar() {
    if (!patient) return;
    var markup = buildPatientMarkup();
    if (!markup) return;

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

  // -------- i18n apply (attribute-driven, explicit only) -----------------

  var ATTR_TARGETS = ["placeholder", "title", "aria-label", "value", "alt"];
  var APPLIED_FLAG = "data-radvisor-i18n-" + locale;

  function applyI18n(root) {
    var scope = root || document.body || document;
    if (!scope) return 0;

    var applied = 0;

    // 1) textContent: data-i18n-{locale}
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

    // 2) attributes: data-i18n-{locale}-{attr}
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
      renderPatientBar();
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
