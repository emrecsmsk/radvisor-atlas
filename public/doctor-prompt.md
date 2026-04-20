# Radvisor Atlas — Rapor HTML Üretim Promptu

Aşağıdaki metni ChatGPT / Claude / Gemini gibi bir LLM'e **tek parça olarak** ver. Sonunda **hangi raporu istediğini** belirt (örn. "Tiroid MR karar destek raporu oluştur"). LLM Atlas'ın yapısına tam uyumlu bir HTML üretir.

---

## 🔵 LLM Prompt (buradan kopyala)

Sen deneyimli bir **radyoloji karar destek aracı** geliştiricisisin. Aşağıdaki kurallara **tam uyan** tek-dosya bir `report.html` üretiyorsun. Bu HTML, **Radvisor Atlas** adlı bir Next.js uygulamasının içinde iframe olarak yüklenir.

### Çıktı formatı

- **Tek dosya**: Sadece `report.html`. CSS ve JS inline (ya da CDN) olacak.
- UTF-8, `<!DOCTYPE html>`, `<html lang="tr">`
- `<title>` tag'inde **kısa, net** başlık. "Karar Destek Sistemi", "Decision Support", "v1/v2/v3", "fixed", "standalone" gibi ekler **yasak**. Örnek: `<title>Tiroid MR</title>`
- `<head>` sonunda **mutlaka** şu satır olacak:
  ```html
  <!-- radvisor-atlas bridge -->
  <script src="/bridge.js"></script>
  ```
- Rapor kendi içinde tam çalışır olacak — iframe dışında da direkt açıldığında bozulmamalı.

### Çift dil desteği (zorunlu)

Her kullanıcıya görünen metin **TR + EN** olacak. İki yol var:

**Yol A — HTML attribute'leri (en sade):**
```html
<h1 data-i18n-tr="Tiroid MR Değerlendirmesi"
    data-i18n-en="Thyroid MRI Assessment"></h1>

<label data-i18n-tr="Boyut (mm)" data-i18n-en="Size (mm)">
  <input type="number" />
</label>

<option data-i18n-tr="Seçiniz" data-i18n-en="Select" value=""></option>
<option data-i18n-tr="Solid" data-i18n-en="Solid" value="solid"></option>
```

Element'in `textContent`'ı başlangıçta TR olur, bridge.js otomatik olarak seçili dile göre günceller.

**Yol B — kendi JS'inden `window.__RADVISOR__.locale` okuyarak metin seç:**
```js
const L = window.__RADVISOR__?.locale || 'tr';
const T = {
  tr: { size: 'Boyut (mm)', normal: 'Normal' },
  en: { size: 'Size (mm)', normal: 'Normal' },
}[L];
document.querySelector('#size-label').textContent = T.size;
```

Daha karmaşık raporlar için (React CDN kullanan, dinamik state'li) Yol B daha pratik.

**İki yolu birleştirebilirsin.** UI stringlerini A ile, dinamik cümleleri B ile yaz.

### Hasta bilgilerine erişim

Bridge.js şunları sunar:

```js
window.__RADVISOR__ = {
  locale: 'tr' | 'en',
  patient: {
    patientName: 'Ayşe',
    patientSurname: 'Yılmaz',
    gender: 'FEMALE',                    // MALE | FEMALE | OTHER
    patientType: 'POLICLINIC',           // POLICLINIC | SERVICE | EMERGENCY | INTENSIVE_CARE | CONSULTATION
    modality: 'MR',
    assignedDoctor: 'Dr. Ahmet Öz',
    approvingDoctor: 'Dr. Mehmet Kaya',
  } | null,                              // null olabilir
  labels: { /* seçili dilde enum karşılıkları */ }
};
```

Bridge **otomatik olarak** hasta özetini `<body>`'nin en üstüne ince bir şerit olarak ekler. Eğer özel konumlandırmak istersen rapor HTML'ine şunu koy:

```html
<div data-radvisor-patient-bar></div>
```

Bridge, içine hasta bilgisini yerleştirir. Böylece **rapor print edildiğinde / PDF alındığında** hasta bilgisi raporun içinde kalır.

Eğer kendi `.rapor-header` bölümünü yazmak istiyorsan, şöyle yap:

```html
<div class="report-header">
  <h1 data-i18n-tr="Tiroid MR Raporu" data-i18n-en="Thyroid MRI Report"></h1>
  <div id="patient-info"></div>
</div>

<script>
  window.addEventListener('radvisor:ready', () => {
    const p = window.__RADVISOR__.patient;
    const L = window.__RADVISOR__.locale;
    if (!p) return;
    const gender = window.__RADVISOR__.labels.gender[p.gender];
    const type   = window.__RADVISOR__.labels.patientType[p.patientType];
    document.getElementById('patient-info').innerHTML = `
      <div><b>${p.patientName} ${p.patientSurname}</b> · ${gender} · ${type}</div>
      <div>${p.modality} · ${L === 'tr' ? 'Sorumlu' : 'Assigned'}: ${p.assignedDoctor}</div>
    `;
  });
</script>
```

### Stil rehberi

- Rapor **print-friendly** olmalı: A4 sayfa genişliği (max 800px container), yeterli margin (20-40px).
- Temiz, medikal görünüm. Açık arkaplan (beyaz veya çok açık gri), koyu metin.
- Hasta şeridi ve başlık her zaman görünür. `@media print` ile şeridin gizlenmesini engelle:
  ```css
  @media print {
    [data-radvisor-patient-bar],
    [data-radvisor-patient-bar-default] {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
  ```
- Form elemanları: radyo, checkbox, select, textarea net ve büyük. Input height en az 36px.
- Renk paleti öneri: primary `#0f3b66` veya `#2e6bc6`, accent `#7ed53e` (başarı / normal), warn `#e59a2e`, danger `#d14d4d`.
- Font: sistem font stack (`-apple-system, Segoe UI, Roboto, sans-serif`) veya "Inter" / "IBM Plex Sans" (CDN izinli).
- Dark tema üretme — Atlas'ın kabuğu zaten dark, iframe'in içi açık renk olmalı ki kontrast olsun.

### Rapor yapısı

1. **Başlık** — rapor adı (data-i18n-tr/en)
2. **Hasta özet şeridi** (bridge otomatik ekler veya kendin konumlandır)
3. **Giriş / Amaç** — 1-2 cümle
4. **Form** — adım adım veya tek sayfa. Her form elemanına `data-i18n-tr` + `data-i18n-en` attribute'leri.
5. **Rapor sonucu** — form dolduruldukça otomatik üretilen metin (print edilebilir bölüm). Bu kısım da çift dilli olmalı — `window.__RADVISOR__.locale`'i oku, ona göre cümle kur.
6. **Aksiyon butonları** — "Raporu Kaydet / Print / PDF" (çift dilli).

### Yasaklar

- ❌ `<title>` içinde "karar destek" / "decision support" / versiyon numarası / "fixed" / "standalone"
- ❌ `localStorage` içinde kimlik bilgisi kaydetmek
- ❌ Dış URL'lere veri göndermek (fetch / XHR)
- ❌ Radvisor Atlas'ın dışına çıkan `<a target="_top">` veya `window.parent.location` manipülasyonu
- ❌ İçeride sabit Türkçe ya da sabit İngilizce metin (tüm metin çift dilli)

### İskelet şablon

Burada minimum geçerli iskelet. Rapora özel form ve mantığı buraya ekleyerek üret:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ Rapor kısa adı — Türkçe }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font: 15px/1.5 -apple-system, Segoe UI, Roboto, sans-serif; color: #1f2937; background: #fff; }
  .page { max-width: 820px; margin: 0 auto; padding: 24px 32px; }
  .report-title { font-size: 22px; font-weight: 700; margin: 18px 0 8px; color: #0f3b66; }
  .section { margin: 24px 0; }
  .section h2 { font-size: 16px; color: #0f3b66; margin-bottom: 10px; border-bottom: 1px solid #e3e7ef; padding-bottom: 6px; }
  label { display: block; margin: 8px 0; font-size: 14px; }
  input[type="text"], input[type="number"], select, textarea {
    width: 100%; padding: 8px 10px; border: 1px solid #cfd4dc; border-radius: 6px; font: inherit;
  }
  .actions { margin-top: 28px; display: flex; gap: 10px; }
  button { padding: 9px 18px; border: 0; border-radius: 6px; cursor: pointer; font: inherit; }
  .btn-primary { background: #0f3b66; color: #fff; }
  .btn-ghost { background: transparent; border: 1px solid #cfd4dc; color: #1f2937; }
  .result { background: #f7f9fc; border: 1px solid #e3e7ef; border-radius: 8px; padding: 16px; margin-top: 20px; white-space: pre-wrap; }
  @media print {
    .actions, .no-print { display: none !important; }
    body { background: #fff; }
  }
</style>

<!-- radvisor-atlas bridge -->
<script src="/bridge.js"></script>
</head>

<body>
<div class="page">
  <!-- Bridge hasta şeridini buraya koyar (isteğe bağlı slot) -->
  <div data-radvisor-patient-bar></div>

  <h1 class="report-title"
      data-i18n-tr="{{ Rapor TR adı }}"
      data-i18n-en="{{ Rapor EN adı }}"></h1>

  <div class="section">
    <h2 data-i18n-tr="Bulgular" data-i18n-en="Findings"></h2>
    <!-- form alanları: hepsi data-i18n-tr + data-i18n-en -->
  </div>

  <div class="actions no-print">
    <button class="btn-primary" onclick="generateReport()"
            data-i18n-tr="Raporu Hazırla" data-i18n-en="Generate Report"></button>
    <button class="btn-ghost" onclick="window.print()"
            data-i18n-tr="Yazdır" data-i18n-en="Print"></button>
  </div>

  <div id="result" class="result" hidden></div>
</div>

<script>
function generateReport() {
  const L = (window.__RADVISOR__ && window.__RADVISOR__.locale) || 'tr';
  const T = {
    tr: { noFindings: 'Bulgu belirtilmemiştir.' },
    en: { noFindings: 'No findings specified.' }
  }[L];
  // ... form verisini topla, T[...] ile metin üret
  const out = document.getElementById('result');
  out.hidden = false;
  out.textContent = T.noFindings;
}
</script>
</body>
</html>
```

### Şimdi bu kurallara uyan bir `report.html` üret — konu:

> **{{ BURAYA RAPORUN KONUSUNU YAZ }}**  
> Örnek: "Karaciğer MR karar destek — LI-RADS v2018 değerlendirmesi için, T2/DWI/ADC/dinamik kontrastlı fazlar, lezyon boyut ve karakterizasyonu, LI-RADS kategorizasyonu."

Raporun formunu, lezyon kategorilerini, sonuç metnini gerçek radyoloji bilgisine göre detaylı hazırla. Placeholder veya "örnek metin" koyma — gerçek klinik içerik.

---

## 🟢 meta.json'u ayrıca hazırla

LLM HTML'i verdikten sonra **aynı klasöre** (`public/reports/<slug>/meta.json`) şu dosyayı ekle:

```json
{
  "title": {
    "tr": "Karaciğer MR — LI-RADS",
    "en": "Liver MRI — LI-RADS"
  },
  "description": {
    "tr": "Kısa açıklama (opsiyonel)",
    "en": "Short description (optional)"
  },
  "requiresPatient": true
}
```

- Slug = klasör adı. Sade, küçük harf, tire ile ayrılmış. "Karar-destek / v1 / fixed / standalone" ekleri yok.
- `requiresPatient: false` koyarsan hasta bilgisi formu açılmadan rapor açılır.

## 🟣 Kontrol listesi (rapor yazıldıktan sonra)

- [ ] `<title>` kısa ve temiz
- [ ] `<script src="/bridge.js"></script>` var
- [ ] Her UI metninde `data-i18n-tr` + `data-i18n-en` var
- [ ] Dinamik rapor metinleri `window.__RADVISOR__.locale` okuyarak üretiliyor
- [ ] `<div data-radvisor-patient-bar></div>` var (veya bridge default bar OK)
- [ ] `@media print` ile yazdırma temiz görünüyor
- [ ] Form action yok, dış URL'ye veri gitmiyor
- [ ] `meta.json` TR + EN ile hazır
