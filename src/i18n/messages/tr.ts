import type { Dictionary } from "./types";

export const tr: Dictionary = {
  shell: {
    brand: "Atlas",
    brandTag: "Radvisor · Atlas",
    languageSwitcherLabel: "Dil",
  },
  catalog: {
    kicker: "Radvisor · Atlas",
    title: "Radyoloji karar destek raporları, tek bir çatı altında.",
    subtitle:
      "MR ve kesitsel görüntüleme için hazırlanmış karar destek formlarını buradan seçin. Rapora tıkladıktan sonra hasta bilgilerini girip değerlendirmeyi tamamlayabilirsiniz.",
    searchPlaceholder: "Rapor ara...",
    reportBadge: "Rapor",
    openReport: "Raporu aç",
    emptyTitle: "Eşleşen rapor bulunamadı",
    emptyHint: "Arama terimini değiştirmeyi deneyin.",
    totalReports: (n: number) => `${n} rapor`,
    filteredReports: (m: number, n: number) => `${m} / ${n} rapor`,
  },
  viewer: {
    backToCatalog: "Kataloğa Dön",
    backShort: "Geri",
    openInNewTab: "Yeni Sekmede Aç",
    openShort: "Aç",
    changePatient: "Hastayı Değiştir",
    patientUnknown: "Hasta bilgisi yok",
  },
  intake: {
    title: "Hasta Bilgileri",
    subtitle: (reportTitle: string) =>
      `${reportTitle} raporu için hasta bilgilerini girin.`,
    fields: {
      patientName: "Hasta Adı",
      patientSurname: "Hasta Soyadı",
      gender: "Cinsiyet",
      patientType: "Hasta Türü",
      modality: "Modalite",
      assignedDoctor: "Sorumlu Doktor",
      approvingDoctor: "Onaylayan Doktor",
    },
    placeholders: {
      modality: "Örn. MR, BT, USG",
      assignedDoctor: "Raporu hazırlayan doktor",
      approvingDoctor: "Raporu onaylayan doktor",
    },
    gender: {
      MALE: "Erkek",
      FEMALE: "Kadın",
      OTHER: "Diğer",
    },
    patientType: {
      POLICLINIC: "Poliklinik",
      SERVICE: "Servis",
      EMERGENCY: "Acil",
      INTENSIVE_CARE: "Yoğun Bakım",
      CONSULTATION: "Konsültasyon",
    },
    genderPlaceholder: "Seçin",
    patientTypePlaceholder: "Seçin",
    cancel: "İptal",
    submit: "Raporu Aç",
    reset: "Bilgileri Temizle",
    keepLastToggle: "Aynı hasta için bir sonraki raporda tekrar sorma",
    errors: {
      required: "Bu alan zorunlu",
      minChars: (n: number) => `En az ${n} karakter`,
    },
  },
  patientBar: {
    unknown: "—",
    genderShort: {
      MALE: "E",
      FEMALE: "K",
      OTHER: "D",
    },
  },
  notFound: {
    kicker: "404 · Rapor",
    title: "Aradığınız rapor bulunamadı.",
    body: "Bağlantı değişmiş ya da rapor kaldırılmış olabilir. Lütfen kataloğa dönüp yeniden seçin.",
    cta: "Kataloğa Dön",
  },
};

export type { Dictionary } from "./types";
