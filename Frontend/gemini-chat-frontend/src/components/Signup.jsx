import { useState } from "react";
import axios from "axios";

const Signup = ({ onSignup, onSwitchToLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
        if (BASE_URL && !BASE_URL.startsWith("http")) {
            BASE_URL = "https://" + BASE_URL;
        }
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/signup`, { username, password });
            onSignup(res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || "Signup Failed");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="text-center mb-4 text-primary fw-bold">Create Account</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0">
                <div className="mb-3">
                    <label>Username</label>
                    <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">Sign Up</button>
                <div className="text-center text-secondary">
                    Already have an account? <span className="text-primary" style={{ cursor: "pointer" }} onClick={onSwitchToLogin}>Log in here</span>
                </div>
            </form>
        </div>
    );
}

export default Signup;
