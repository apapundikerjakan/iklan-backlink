import './globals.css';

export const metadata = {
  title: 'Drive Video',
  robots: 'noindex, nofollow',
  other: {
    monetag: 'a7ca7fea52600113a92728838e95f6fb'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
