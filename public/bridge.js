/*
 * Radvisor Atlas — rapor köprüsü
 * Doktorun gönderdiği HTML rapor dosyasına tek satırda eklenir:
 *   <script src="/bridge.js"></script>
 *
 * Ne yapar:
 *   - URL parametresinden `locale` ve `patient` bilgisini okur
 *   - window.__RADVISOR__ olarak sunar (rapor istediği gibi kullanır)
 *   - `radvisor:ready` event'ini yayar
 *   - Sayfada [data-radvisor-patient-bar] elementi varsa hasta özetini ona yazar;
 *     yoksa <body>'nin en üstüne minimal bir hasta şeridi ekler
 *   - [data-i18n-tr] / [data-i18n-en] gibi attribute'leri aktif dile göre uygular
 */
(function () {
  "use strict";

  function parsePatient(raw) {
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch (e) {
      try {
        return JSON.parse(raw);
      } catch (e2) {
        return null;
      }
    }
  }

  var qs = new URLSearchParams(location.search);
  var locale = qs.get("locale") || "tr";
  var patient = parsePatient(qs.get("patient"));

  var labels = {
    tr: {
      gender: { MALE: "Erkek", FEMALE: "Kadın", OTHER: "Diğer" },
      patientType: {
        POLICLINIC: "Poliklinik",
        SERVICE: "Servis",
        EMERGENCY: "Acil",
        INTENSIVE_CARE: "Yoğun Bakım",
        CONSULTATION: "Konsültasyon",
      },
      fields: {
        name: "Hasta",
        gender: "Cinsiyet",
        patientType: "Tür",
        modality: "Modalite",
        assignedDoctor: "Sorumlu",
        approvingDoctor: "Onaylayan",
      },
    },
    en: {
      gender: { MALE: "Male", FEMALE: "Female", OTHER: "Other" },
      patientType: {
        POLICLINIC: "Outpatient",
        SERVICE: "Inpatient",
        EMERGENCY: "Emergency",
        INTENSIVE_CARE: "Intensive Care",
        CONSULTATION: "Consultation",
      },
      fields: {
        name: "Patient",
        gender: "Gender",
        patientType: "Type",
        modality: "Modality",
        assignedDoctor: "Assigned",
        approvingDoctor: "Approving",
      },
    },
  };
  var L = labels[locale] || labels.tr;

  // Expose for the report script
  window.__RADVISOR__ = {
    locale: locale,
    patient: patient,
    labels: L,
  };

  function buildPatientText() {
    if (!patient) return "";
    var parts = [];
    parts.push(
      L.fields.name +
        ": " +
        (patient.patientName || "") +
        " " +
        (patient.patientSurname || ""),
    );
    if (patient.gender && L.gender[patient.gender]) {
      parts.push(L.fields.gender + ": " + L.gender[patient.gender]);
    }
    if (patient.patientType && L.patientType[patient.patientType]) {
      parts.push(L.fields.patientType + ": " + L.patientType[patient.patientType]);
    }
    if (patient.modality) {
      parts.push(L.fields.modality + ": " + patient.modality);
    }
    if (patient.assignedDoctor) {
      parts.push(L.fields.assignedDoctor + ": " + patient.assignedDoctor);
    }
    if (patient.approvingDoctor) {
      parts.push(L.fields.approvingDoctor + ": " + patient.approvingDoctor);
    }
    return parts.join(" · ");
  }

  function renderPatientBar() {
    if (!patient) return;
    var text = buildPatientText();
    if (!text) return;

    // If author put a custom slot, fill it
    var slot = document.querySelector("[data-radvisor-patient-bar]");
    if (slot) {
      slot.textContent = text;
      slot.setAttribute("data-radvisor-filled", "true");
      return;
    }

    // Otherwise prepend a sensible default bar
    if (!document.body) return;
    var bar = document.createElement("div");
    bar.setAttribute("data-radvisor-patient-bar-default", "true");
    bar.style.cssText = [
      "padding:10px 20px",
      "background:#f5f7fb",
      "border-bottom:1px solid #dde2eb",
      "font:13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      "color:#1f2937",
      "display:flex",
      "flex-wrap:wrap",
      "gap:4px 14px",
      "print-color-adjust:exact",
      "-webkit-print-color-adjust:exact",
    ].join(";");
    bar.textContent = text;
    document.body.insertBefore(bar, document.body.firstChild);
  }

  function applyInlineTranslations() {
    var attr = "data-i18n-" + locale;
    var nodes = document.querySelectorAll("[" + attr + "]");
    for (var i = 0; i < nodes.length; i++) {
      var v = nodes[i].getAttribute(attr);
      if (v != null) nodes[i].textContent = v;
    }
  }

  function run() {
    try {
      renderPatientBar();
      applyInlineTranslations();
    } catch (e) {
      // never break the host report
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
      // older browsers
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
