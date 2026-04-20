/*
 * Radvisor Atlas — rapor köprüsü / report bridge
 * <script src="/bridge.js"></script>
 *
 * Yaptıkları:
 *   - URL parametresinden `locale` ve `patient` bilgisini okur
 *   - window.__RADVISOR__ olarak sunar
 *   - Rapora print-safe bir hasta şeridi ekler
 *   - `[data-i18n-tr]` / `[data-i18n-en]` attribute'lerini aktif dile göre uygular
 *   - locale=en iken explicit attribute olmayan metinleri dahili TR→EN UI sözlüğü ile çevirir
 *   - `radvisor:ready` event'ini yayar
 */
(function () {
  "use strict";

  // ========================================================================
  // 1. URL params
  // ========================================================================
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

  // ========================================================================
  // 2. Labels
  // ========================================================================
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
        patient: "Hasta",
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
        patient: "Patient",
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

  // ========================================================================
  // 3. TR → EN UI sözlüğü
  //   Not: burada sadece güvenli UI/yapısal terimler var.
  //   Tıbbi terimler (lezyon adları, radyolojik ölçümler vs.) dokunulmaz —
  //   yanlış çeviri riski doktorun işini bozar. Rapor yazarı özel metin
  //   çevirisini data-i18n-en attribute'u ile explicit verir.
  // ========================================================================
  var DICT = {
    // --- Navigation / actions ---
    "İleri": "Next",
    "Geri": "Back",
    "Sonraki": "Next",
    "Önceki": "Previous",
    "İlk": "First",
    "Son": "Last",
    "Kaydet": "Save",
    "Kaydet & Devam Et": "Save & Continue",
    "Yazdır": "Print",
    "Yazdır / PDF": "Print / PDF",
    "PDF": "PDF",
    "PDF Olarak Kaydet": "Save as PDF",
    "PDF'e Kaydet": "Save as PDF",
    "Kopyala": "Copy",
    "Kopyalandı": "Copied",
    "Panoya Kopyala": "Copy to Clipboard",
    "Temizle": "Clear",
    "Sıfırla": "Reset",
    "Yenile": "Refresh",
    "Kapat": "Close",
    "Aç": "Open",
    "İptal": "Cancel",
    "Vazgeç": "Cancel",
    "Tamam": "OK",
    "Onayla": "Approve",
    "Reddet": "Reject",
    "Gönder": "Submit",
    "Hazırla": "Generate",
    "Oluştur": "Create",
    "Düzenle": "Edit",
    "Sil": "Delete",
    "Ekle": "Add",
    "Çıkar": "Remove",
    "Seç": "Select",
    "Seçin": "Select",
    "Seçiniz": "Select",
    "Ara": "Search",
    "Filtrele": "Filter",
    "Devam": "Continue",
    "Devam Et": "Continue",
    "Başla": "Start",
    "Bitir": "Finish",
    "Tamamla": "Complete",

    // --- Yes / no / presence ---
    "Evet": "Yes",
    "Hayır": "No",
    "Var": "Present",
    "Yok": "Absent",
    "Mevcut": "Present",
    "Yok değil": "Present",
    "Bilinmiyor": "Unknown",
    "Belirsiz": "Uncertain",
    "Şüpheli": "Suspicious",
    "Net": "Clear",
    "Normal": "Normal",
    "Anormal": "Abnormal",
    "Pozitif": "Positive",
    "Negatif": "Negative",

    // --- Patient / demographics ---
    "Hasta": "Patient",
    "Hasta Adı": "Patient Name",
    "Hasta Soyadı": "Patient Surname",
    "Hastanın Adı": "Patient's Name",
    "Hasta Bilgileri": "Patient Information",
    "Hasta Bilgisi": "Patient Information",
    "Ad": "First Name",
    "Soyad": "Last Name",
    "Ad Soyad": "Full Name",
    "Yaş": "Age",
    "Cinsiyet": "Gender",
    "Erkek": "Male",
    "Kadın": "Female",
    "Diğer": "Other",
    "Tarih": "Date",
    "Tarih / Saat": "Date / Time",
    "Saat": "Time",
    "Doğum Tarihi": "Date of Birth",
    "T.C. Kimlik": "National ID",
    "T.C. Kimlik No": "National ID No",
    "Protokol No": "Protocol No",
    "Dosya No": "Chart No",
    "Hasta Türü": "Patient Type",
    "Poliklinik": "Outpatient",
    "Servis": "Inpatient",
    "Acil": "Emergency",
    "Yoğun Bakım": "Intensive Care",
    "Konsültasyon": "Consultation",

    // --- Doctor / roles ---
    "Doktor": "Doctor",
    "Hekim": "Physician",
    "Sorumlu Doktor": "Assigned Doctor",
    "Onaylayan Doktor": "Approving Doctor",
    "Raporu Hazırlayan": "Report Prepared By",
    "Raporu Onaylayan": "Report Approved By",
    "İsteyen Hekim": "Requesting Physician",
    "Uzman": "Specialist",
    "Asistan": "Resident",

    // --- Report / content ---
    "Rapor": "Report",
    "Rapor Adı": "Report Name",
    "Raporu Hazırla": "Generate Report",
    "Rapor Hazırla": "Generate Report",
    "Raporu Oluştur": "Create Report",
    "Rapor Oluştur": "Create Report",
    "Raporu Kaydet": "Save Report",
    "Rapor Çıktısı": "Report Output",
    "Rapor Metni": "Report Text",
    "Rapor Sonucu": "Report Result",
    "Sonuç": "Result",
    "Sonuçlar": "Results",
    "Bulgular": "Findings",
    "Bulgu": "Finding",
    "Klinik": "Clinical",
    "Klinik Bilgi": "Clinical Information",
    "Endikasyon": "Indication",
    "Teknik": "Technique",
    "Açıklama": "Description",
    "Detay": "Detail",
    "Detaylar": "Details",
    "Özet": "Summary",
    "Not": "Note",
    "Notlar": "Notes",
    "Yorum": "Comment",
    "Yorumlar": "Comments",
    "Öneri": "Recommendation",
    "Öneriler": "Recommendations",
    "İmpresyon": "Impression",
    "Kanaat": "Impression",
    "Değerlendirme": "Assessment",

    // --- Modalities ---
    "Modalite": "Modality",
    "MR": "MRI",
    "BT": "CT",
    "USG": "US",
    "US": "US",
    "Röntgen": "X-ray",

    // --- Measurements / dimensions ---
    "Boyut": "Size",
    "Boyutlar": "Dimensions",
    "Uzunluk": "Length",
    "Genişlik": "Width",
    "Kalınlık": "Thickness",
    "Derinlik": "Depth",
    "Çap": "Diameter",
    "Hacim": "Volume",
    "Alan": "Area",
    "Yükseklik": "Height",
    "mm": "mm",
    "cm": "cm",

    // --- Localisation / laterality ---
    "Sağ": "Right",
    "Sol": "Left",
    "Bilateral": "Bilateral",
    "Her İki": "Both",
    "Her iki": "Both",
    "Ön": "Anterior",
    "Arka": "Posterior",
    "Üst": "Superior",
    "Alt": "Inferior",
    "İç": "Medial",
    "Dış": "Lateral",
    "Proksimal": "Proximal",
    "Distal": "Distal",
    "Merkezi": "Central",
    "Periferik": "Peripheral",
    "Fokal": "Focal",
    "Diffüz": "Diffuse",
    "Yaygın": "Diffuse",
    "Lokal": "Local",
    "Segmental": "Segmental",

    // --- Generic form helpers ---
    "Zorunlu": "Required",
    "Zorunlu alan": "Required field",
    "Bu alan zorunlu": "This field is required",
    "Geçerli değil": "Invalid",
    "Geçersiz": "Invalid",
    "Hata": "Error",
    "Uyarı": "Warning",
    "Bilgi": "Info",
    "Adım": "Step",
    "Adımlar": "Steps",
    "Toplam": "Total",
    "Puan": "Score",
    "Skor": "Score",
    "Kategori": "Category",
    "Tür": "Type",
    "Tip": "Type",
    "Grup": "Group",
    "Seviye": "Level",

    // --- Common findings adjectives ---
    "Homojen": "Homogeneous",
    "Heterojen": "Heterogeneous",
    "Düzenli": "Regular",
    "Düzensiz": "Irregular",
    "Sınırlı": "Well-defined",
    "Belirsiz sınır": "Ill-defined",
    "Keskin": "Sharp",
    "Silik": "Blurred",
    "Minimal": "Minimal",
    "Hafif": "Mild",
    "Orta": "Moderate",
    "Belirgin": "Marked",
    "Ciddi": "Severe",
    "Şiddetli": "Severe",
    "Hafif-orta": "Mild-to-moderate",
    "Orta-şiddetli": "Moderate-to-severe",

    // --- Colours / status indicators (for print legends etc.) ---
    "Kırmızı": "Red",
    "Yeşil": "Green",
    "Sarı": "Yellow",
    "Mavi": "Blue",

    // --- Report sections commonly seen in these HTMLs ---
    "Teknik Bilgiler": "Technical Information",
    "İnceleme": "Examination",
    "Protokol": "Protocol",
    "Sekans": "Sequence",
    "Sekanslar": "Sequences",
    "Plan": "Plan",
    "Planlar": "Planes",
    "Aksiyel": "Axial",
    "Sagital": "Sagittal",
    "Koronal": "Coronal",
    "Kesit": "Slice",
    "Kesitler": "Slices",
    "Kesit Kalınlığı": "Slice Thickness",
    "Matriks": "Matrix",
    "FOV": "FOV",

    // --- Intake-style labels that may still appear inside reports ---
    "Rapor Dili": "Report Language",
    "Dil": "Language",
    "Türkçe": "Turkish",
    "İngilizce": "English",
  };

  // ========================================================================
  // 4. Styles
  // ========================================================================
  var STYLE = [
    "[data-radvisor-root]{",
    "  font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;",
    "  color:#1f2937;",
    "  -webkit-print-color-adjust:exact;print-color-adjust:exact;",
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
  ].join("\n");

  function injectStylesOnce() {
    if (document.getElementById("radvisor-atlas-style")) return;
    var s = document.createElement("style");
    s.id = "radvisor-atlas-style";
    s.textContent = STYLE;
    (document.head || document.documentElement).appendChild(s);
  }

  // ========================================================================
  // 5. Patient strip
  // ========================================================================
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

  // ========================================================================
  // 6. Inline i18n attributes
  // ========================================================================
  function applyInlineTranslations() {
    var attr = "data-i18n-" + locale;
    var nodes = document.querySelectorAll("[" + attr + "]");
    for (var i = 0; i < nodes.length; i++) {
      var v = nodes[i].getAttribute(attr);
      if (v != null) nodes[i].textContent = v;
    }
  }

  // ========================================================================
  // 7. Dictionary fallback (locale=en, explicit attribute yoksa)
  // ========================================================================
  function translateWithDictionary() {
    if (locale !== "en") return;

    // Skip the patient bar + its children — already rendered correctly
    var skipSelector =
      "[data-radvisor-patient-bar],[data-radvisor-patient-bar-default],[data-i18n-skip]";

    // ---- Text nodes ----
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (n) {
          if (!n.parentElement) return NodeFilter.FILTER_REJECT;
          if (n.parentElement.closest(skipSelector))
            return NodeFilter.FILTER_REJECT;
          var tag = n.parentElement.tagName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false,
    );

    var nodes = [];
    var cur;
    while ((cur = walker.nextNode())) nodes.push(cur);

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var raw = node.nodeValue;
      var trimmed = raw.trim();
      if (!trimmed) continue;

      // Strip trailing colon/asterisk and match; preserve formatting
      var m = trimmed.match(/^([\s\S]*?)([:*?!]?)$/);
      var core = m ? m[1] : trimmed;
      var tail = m ? m[2] : "";

      if (DICT[core]) {
        var before = raw.substring(0, raw.indexOf(trimmed));
        var after = raw.substring(raw.indexOf(trimmed) + trimmed.length);
        node.nodeValue = before + DICT[core] + tail + after;
      } else if (DICT[trimmed]) {
        var before2 = raw.substring(0, raw.indexOf(trimmed));
        var after2 = raw.substring(raw.indexOf(trimmed) + trimmed.length);
        node.nodeValue = before2 + DICT[trimmed] + after2;
      }
    }

    // ---- placeholder attributes ----
    var phs = document.querySelectorAll("[placeholder]");
    for (var j = 0; j < phs.length; j++) {
      var p = phs[j].getAttribute("placeholder");
      if (!p) continue;
      var pt = p.trim();
      if (DICT[pt]) phs[j].setAttribute("placeholder", DICT[pt]);
    }

    // ---- value attributes on buttons/inputs (type=button|submit|reset) ----
    var btns = document.querySelectorAll(
      'input[type="button"],input[type="submit"],input[type="reset"]',
    );
    for (var k = 0; k < btns.length; k++) {
      var v = btns[k].getAttribute("value");
      if (!v) continue;
      var vt = v.trim();
      if (DICT[vt]) btns[k].setAttribute("value", DICT[vt]);
    }

    // ---- title / aria-label attributes ----
    var attrTargets = ["title", "aria-label"];
    for (var a = 0; a < attrTargets.length; a++) {
      var els = document.querySelectorAll("[" + attrTargets[a] + "]");
      for (var e = 0; e < els.length; e++) {
        var val = els[e].getAttribute(attrTargets[a]);
        if (!val) continue;
        var vt2 = val.trim();
        if (DICT[vt2]) els[e].setAttribute(attrTargets[a], DICT[vt2]);
      }
    }
  }

  // ========================================================================
  // 8. Boot
  // ========================================================================
  function run() {
    try {
      injectStylesOnce();
      renderPatientBar();
      applyInlineTranslations();
      translateWithDictionary();
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
