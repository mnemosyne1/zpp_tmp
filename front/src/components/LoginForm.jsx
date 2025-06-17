import { useState } from 'react';
import { loginWithCredentials } from '../firebase';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginWithCredentials(login, password);
            navigate('/chat');
        } catch (err) {
            setError('Niepoprawne dane logowania');
            console.error('Błąd logowania:', err);
        }
    };

    return (
        <div className="login-container">
        <h2>Logowanie</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Twój login"
            required
            />
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Hasło"
            required
            />
            <button type="submit">Zaloguj się</button>
        </form>
        </div>
    );
};