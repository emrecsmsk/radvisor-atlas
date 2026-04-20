import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { I18nProvider } from "@/i18n/I18nProvider";
import { PatientProvider } from "@/state/PatientProvider";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Radvisor Atlas",
    template: "%s · Radvisor Atlas",
  },
  description: "Radvisor karar destek raporlarının merkez koleksiyonu.",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col shell-backdrop">
        <I18nProvider>
          <PatientProvider>{children}</PatientProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
