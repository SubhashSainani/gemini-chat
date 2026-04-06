import { useState } from "react";
import axios from "axios";

const Login = ({ onLogin, onSwitchToSignup }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
            onLogin(res.data.token);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid credentials");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "400px" }}>
            <h2 className="text-center mb-4 text-primary fw-bold">Login required</h2>
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
                <button type="submit" className="btn btn-primary w-100 mb-3">Log In</button>
                <div className="text-center text-secondary">
                    Don't have an account? <span className="text-primary" style={{ cursor: "pointer" }} onClick={onSwitchToSignup}>Sign up here</span>
                </div>
            </form>
        </div>
    );
}

export default Login;
