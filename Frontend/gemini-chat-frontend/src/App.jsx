import './App.css'
import ChatInput from './components/ChatInput'
import ChatResponse from './components/ChatResponse'
import Login from './components/Login'
import Signup from './components/Signup'
import { streamChatResponse, fetchSessions, fetchSessionMessages } from './services/api';
import { useState, useEffect } from 'react';

function App() {
  const [sessions, setSessions] = useState([{ id: null, title: 'New Chat', messages: [] }]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [showSignup, setShowSignup] = useState(false);

  const handleAuth = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setSessions([{ id: null, title: 'New Chat', messages: [] }]);
    setCurrentSessionIndex(0);
  }

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    try {
      const userSessions = await fetchSessions(token);
      if (userSessions && userSessions.length > 0) {
        const hydratedSessions = [];
        for (const s of userSessions) {
          const msgs = await fetchSessionMessages(s.id, token);
          hydratedSessions.push({ id: s.id, title: s.title, messages: msgs });
        }
        setSessions(hydratedSessions);
        setCurrentSessionIndex(0);
      }
    } catch (err) {
      console.error("Failed to load chat history", err);
      if (err.message && err.message.includes("401")) handleLogout();
    }
  };

  const messages = sessions[currentSessionIndex]?.messages || [];

  const handleNewChat = () => {
    setSessions([...sessions, { id: null, title: 'New Chat', messages: [] }]);
    setCurrentSessionIndex(sessions.length);
  }

  const handleQuestionSubmit = async (question, file) => {
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: file ? question + ' [Attachment included]' : question }, { role: 'model', content: '' }];

    // Update the specific session
    setSessions(prev => {
      const updated = [...prev];
      updated[currentSessionIndex] = { ...updated[currentSessionIndex], messages: newMessages };
      return updated;
    });

    try {
      const activeSessionId = sessions[currentSessionIndex].id;
      await streamChatResponse(question, file, token, activeSessionId, (chunk) => {
        setSessions(prev => {
          const updatedSessions = [...prev];
          const sessionToUpdate = { ...updatedSessions[currentSessionIndex] };

          if (sessionToUpdate.title === 'New Chat') {
            sessionToUpdate.title = question.substring(0, 20) + (question.length > 20 ? '...' : '');
          }

          const updatedMessages = [...sessionToUpdate.messages];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: updatedMessages[lastMessageIndex].content + chunk
          };
          sessionToUpdate.messages = updatedMessages;
          updatedSessions[currentSessionIndex] = sessionToUpdate;
          return updatedSessions;
        });
      });
    } catch (error) {
      console.error(error);
      const userMessage = messages[messages.length - 1];
      if (userMessage && userMessage.content === "") {
        alert("Failed to get response: Check if you are hitting api limit or logged out");
      }
      if (error && error.message && error.message.includes("401")) handleLogout();
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="App bg-light min-vh-100 d-flex align-items-center justify-content-center">
        {showSignup ? (
          <Signup onSignup={handleAuth} onSwitchToLogin={() => setShowSignup(false)} />
        ) : (
          <Login onLogin={handleAuth} onSwitchToSignup={() => setShowSignup(true)} />
        )}
      </div>
    );
  }

  return (
    <div className='App d-flex' style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
        <h4 className="border-bottom pb-2 mb-3">Chats</h4>
        <button className="btn btn-primary mb-3 w-100" onClick={handleNewChat} disabled={loading}>+ New Chat</button>
        <div style={{ overflowY: 'auto', flexGrow: 1 }}>
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className={`p-2 mb-2 rounded cursor-pointer ${idx === currentSessionIndex ? 'bg-secondary' : 'bg-transparent text-secondary'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => !loading && setCurrentSessionIndex(idx)}
            >
              {session.title || 'New Chat'}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column bg-light">
        <header className='bg-white border-bottom text-dark py-3 px-4 shadow-sm d-flex justify-content-between align-items-center'>
          <h2 className="m-0 text-primary fw-bold">Gemini ChatBot AI</h2>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Log Out</button>
        </header>
        <div className="chat-container my-4 px-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          <ChatResponse messages={messages} />
          {loading && messages.length > 0 && messages[messages.length - 1].content === "" && (
            <div className="container"><p className="text-secondary text-center placeholder-glow"><span className="placeholder col-6"></span></p></div>
          )}
        </div>
        <div className="bg-white border-top p-3 shadow-sm">
          <ChatInput onSubmit={handleQuestionSubmit} disabled={loading} />
        </div>
      </div>
    </div>
  )
}

export default App
