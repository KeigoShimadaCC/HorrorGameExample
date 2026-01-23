import "./globals.css";

export const metadata = {
  title: "Scene Editor",
  description: "Developer scene editor for HorrorGame",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
