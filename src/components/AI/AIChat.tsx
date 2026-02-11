import { useState } from 'react';
import { Send } from 'lucide-react';
import { api, ChatMessage } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError('');

    const response = await api.aiChat(user.uid, newMessages);

    if (response.error || !response.data) {
      setError(response.error || 'Failed to get AI response');
      setLoading(false);
      return;
    }

    const aiMessage: ChatMessage = { role: 'assistant', content: response.data.reply };
    setMessages([...newMessages, aiMessage]);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3">AI Career Assistant</h3>
      <div className="flex-1 border border-gray-200 rounded-lg p-3 mb-3 overflow-y-auto space-y-2 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-500">Ask about careers, alumni networking, or interview prep.</p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-50 text-blue-900 self-end'
                : 'bg-gray-100 text-gray-900 self-start'
            }`}
          >
            <strong className="block text-xs mb-1">
              {m.role === 'user' ? 'You' : 'AlumniConnect AI'}
            </strong>
            <p>{m.content}</p>
          </div>
        ))}
        {loading && <p className="text-gray-400 text-xs">AI is thinking...</p>}
      </div>
      {error && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

