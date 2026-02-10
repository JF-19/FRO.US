import Link from 'next/link'

export default function Home({ user }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">FRO.US</h1>
        <p className="text-xl text-gray-600 mb-8">
          Your voice matters. Vote on polls and see what America thinks.
        </p>
        {user ? (
          <div className="flex gap-4 justify-center">
            <Link
              href="/polls"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              View Polls
            </Link>
            <Link
              href="/results"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              View Results
            </Link>
          </div>
        ) : (
          <Link
            href="/auth"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
          >
            Get Started
          </Link>
        )}
      </div>
    </main>
  )
}
