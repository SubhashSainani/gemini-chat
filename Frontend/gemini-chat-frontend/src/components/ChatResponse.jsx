import { useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatResponse = ({ messages }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!messages || messages.length === 0) {
        return null;
    }

    return (
        <div className="container">
            {messages.map((msg, index) => (
                <div className={`card mb-3 ${msg.role === 'user' ? 'bg-light border-0' : 'bg-transparent border-0'}`} key={index}>
                    <div className="card-body">
                        <h5 className="card-title fw-bold text-primary mb-3">
                            {msg.role === 'user' ? 'You' : 'Gemini'}
                        </h5>
                        {msg.role === 'user' ? (
                            <p className="card-text">{msg.content}</p>
                        ) : (
                            <ReactMarkdown
                                children={msg.content}
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                {...props}
                                                children={String(children).replace(/\n$/, '')}
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                            />
                                        ) : (
                                            <code {...props} className={className}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default ChatResponse;