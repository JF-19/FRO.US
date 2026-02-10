import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Polls({ user }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchPolls()
  }, [user])

  const fetchPolls = async () => {
    try {
      // Get all active polls
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      // Get user's votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('poll_id')
        .eq('user_id', user.id)

      if (votesError) throw votesError

      const votedPollIds = new Set(votesData.map((v) => v.poll_id))

      // Mark polls as voted
      const pollsWithVoteStatus = pollsData.map((poll) => ({
        ...poll,
        options: JSON.parse(poll.options),
        hasVoted: votedPollIds.has(poll.id),
      }))

      setPolls(pollsWithVoteStatus)
    } catch (error) {
      console.error('Error fetching polls:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (pollId, optionIndex) => {
    setVoting(pollId)

    try {
      // Get user's state
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('state')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // Submit vote
      const { error: voteError } = await supabase.from('votes').insert([
        {
          poll_id: pollId,
          user_id: user.id,
          option_index: optionIndex,
          state: userData.state,
        },
      ])

      if (voteError) throw voteError

      // Refresh polls
      fetchPolls()
    } catch (error) {
      alert('Error submitting vote: ' + error.message)
    } finally {
      setVoting(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">Loading polls...</div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Active Polls</h1>

      {polls.length === 0 ? (
        <p className="text-gray-600">No active polls at the moment.</p>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{poll.question}</h2>

              {poll.hasVoted ? (
                <div className="bg-green-100 text-green-800 p-3 rounded">
                  ✓ You've already voted on this poll
                </div>
              ) : (
                <div className="space-y-2">
                  {poll.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleVote(poll.id, index)}
                      disabled={voting === poll.id}
                      className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 hover:border-blue-600 transition disabled:bg-gray-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
