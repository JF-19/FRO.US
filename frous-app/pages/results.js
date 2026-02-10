import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Results({ user }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchResults()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('votes-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, () => {
        fetchResults()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const fetchResults = async () => {
    try {
      // Get all polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      // Get all votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')

      if (votesError) throw votesError

      // Calculate results
      const pollsWithResults = pollsData.map((poll) => {
        const options = JSON.parse(poll.options)
        const pollVotes = votesData.filter((v) => v.poll_id === poll.id)

        // National results
        const nationalCounts = options.map((_, idx) =>
          pollVotes.filter((v) => v.option_index === idx).length
        )
        const totalVotes = nationalCounts.reduce((a, b) => a + b, 0)

        // State results
        const stateResults = {}
        pollVotes.forEach((vote) => {
          if (!stateResults[vote.state]) {
            stateResults[vote.state] = options.map(() => 0)
          }
          stateResults[vote.state][vote.option_index]++
        })

        return {
          ...poll,
          options,
          nationalCounts,
          totalVotes,
          stateResults,
        }
      })

      setPolls(pollsWithResults)
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">Loading results...</div>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Poll Results</h1>

      {polls.length === 0 ? (
        <p className="text-gray-600">No polls yet.</p>
      ) : (
        <div className="space-y-8">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{poll.question}</h2>
              <p className="text-gray-600 mb-6">Total votes: {poll.totalVotes}</p>

              {/* National Results */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">National Results</h3>
                <div className="space-y-3">
                  {poll.options.map((option, idx) => {
                    const count = poll.nationalCounts[idx]
                    const percentage = poll.totalVotes > 0
                      ? ((count / poll.totalVotes) * 100).toFixed(1)
                      : 0
                    return (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span>{option}</span>
                          <span className="font-semibold">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* State Results */}
              {Object.keys(poll.stateResults).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Results by State</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(poll.stateResults)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([state, counts]) => {
                        const stateTotal = counts.reduce((a, b) => a + b, 0)
                        const topOptionIdx = counts.indexOf(Math.max(...counts))
                        return (
                          <div key={state} className="border rounded p-3">
                            <h4 className="font-semibold mb-2">{state}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {stateTotal} votes
                            </p>
                            <div className="space-y-1">
                              {poll.options.map((option, idx) => {
                                const percentage = stateTotal > 0
                                  ? ((counts[idx] / stateTotal) * 100).toFixed(0)
                                  : 0
                                return (
                                  <div
                                    key={idx}
                                    className={`text-sm ${
                                      idx === topOptionIdx ? 'font-semibold' : ''
                                    }`}
                                  >
                                    {option}: {percentage}%
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
