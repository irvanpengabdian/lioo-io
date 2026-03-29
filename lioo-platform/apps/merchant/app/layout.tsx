import "./globals.css";

export const metadata = {
  title: "Merchant Dashboard | lioo.io",
  description: "Merchant administration portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  primary: "#2c4f1b",
                  "primary-container": "#436831",
                  "on-surface": "#1a1c19",
                  "on-surface-variant": "#43493e",
                  "outline-variant": "#c3c9ba",
                  "secondary-container": "#bbeda6",
                  "surface-container-lowest": "#ffffff",
                  "surface-container-low": "#f3f4ef",
                  "surface-container-highest": "#e2e3de",
                  background: "#f9faf5",
                  outline: "#73796d",
                },
                fontFamily: {
                  sans: ['Plus Jakarta Sans', 'sans-serif'],
                }
              }
            }
          }
        `}} />
        <style dangerouslySetInnerHTML={{__html: `
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          body { background-color: #F9FAF5; }
        `}} />
      </head>
      <body className="bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
