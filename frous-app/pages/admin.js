import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/router'

export default function Admin({ user }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [polls, setPolls] = useState([])
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
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolls(data.map(poll => ({ ...poll, options: JSON.parse(poll.options) })))
    } catch (error) {
      console.error('Error fetching polls:', error)
    }
  }

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleCreatePoll = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const filteredOptions = options.filter((opt) => opt.trim() !== '')

      if (filteredOptions.length < 2) {
        alert('Please provide at least 2 options')
        setLoading(false)
        return
      }

      const { error } = await supabase.from('polls').insert([
        {
          question: question.trim(),
          options: JSON.stringify(filteredOptions),
          creator_id: user.id,
          active: true,
        },
      ])

      if (error) throw error

      // Reset form
      setQuestion('')
      setOptions(['', ''])
      alert('Poll created successfully!')
      fetchPolls()
    } catch (error) {
      alert('Error creating poll: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePollStatus = async (pollId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('polls')
        .update({ active: !currentStatus })
        .eq('id', pollId)

      if (error) throw error
      fetchPolls()
    } catch (error) {
      alert('Error updating poll: ' + error.message)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Create Poll Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>

        <form onSubmit={handleCreatePoll}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="What is your question?"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-blue-600 hover:underline"
            >
              + Add Another Option
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>

      {/* Existing Polls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Polls</h2>

        {polls.length === 0 ? (
          <p className="text-gray-600">No polls created yet.</p>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <div key={poll.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{poll.question}</h3>
                  <button
                    onClick={() => togglePollStatus(poll.id, poll.active)}
                    className={`px-3 py-1 rounded text-sm ${
                      poll.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {poll.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <ul className="list-disc list-inside text-gray-600">
                  {poll.options.map((option, idx) => (
                    <li key={idx}>{option}</li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Created: {new Date(poll.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
