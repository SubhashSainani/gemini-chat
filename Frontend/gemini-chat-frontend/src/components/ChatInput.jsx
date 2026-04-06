import { useState } from "react";

const ChatInput = ({ onSubmit, disabled }) => {
    const [question, setQuestion] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim() || file) {
            onSubmit(question, file);
            setQuestion("");
            setFile(null);
        }
    }

    return (
        <div className="container my-4">
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-2">
                    <label htmlFor="question">Ask a Question</label>
                    <input
                        type="text"
                        className="form-control"
                        id="question"
                        placeholder="Enter your question"
                        value={question}
                        disabled={disabled}
                        onChange={(e) => setQuestion(e.target.value)} />
                </div>

                <div className="form-group mb-2">
                    <label htmlFor="file" className="text-secondary small">Attach an Image (Optional)</label>
                    <input
                        type="file"
                        className="form-control"
                        id="file"
                        disabled={disabled}
                        onChange={(e) => setFile(e.target.files[0])} />
                </div>

                <button type="submit" className="btn btn-primary mt-2" disabled={disabled}>
                    Submit
                </button>
            </form>
        </div>
    )
}

export default ChatInput;