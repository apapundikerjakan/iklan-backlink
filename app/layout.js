import './globals.css';

export const metadata = {
  title: 'Drive Video',
  robots: 'noindex, nofollow'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
