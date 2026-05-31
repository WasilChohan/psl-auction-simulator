import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-pslDark via-pslGreen to-emerald-300 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}