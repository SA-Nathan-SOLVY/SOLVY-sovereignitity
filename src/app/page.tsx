import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">SOLVY Sovereign Platform</h1>
      <div className="space-y-4">
        <Link href="/solvy-card" className="block text-blue-600 hover:underline">
          → SOLVY Card Page
        </Link>
        <Link href="/sps-presentation" className="block text-blue-600 hover:underline">
          → SPS Presentation Page
        </Link>
      </div>
    </div>
  );
}
