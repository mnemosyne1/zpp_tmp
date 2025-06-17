import { useState } from 'react';
import { 
  loginWithCredentials, 
  registerWithLogin 
} from '../firebase';
import "../css/AuthForm.css";

const AuthForm = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await loginWithCredentials(login, password);
      } else {
        await registerWithLogin(login, password);
        // Automatyczne logowanie po rejestracji
        await loginWithCredentials(login, password);
      }
    } catch (err) {
      setError(isLoginMode ? 'Błąd logowania' : 'Błąd rejestracji');
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLoginMode ? 'Logowanie' : 'Rejestracja'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="Login"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Hasło"
          required
          minLength="6"
        />
        
        <button type="submit" className="btn-submit">
          {isLoginMode ? 'Zaloguj się' : 'Zarejestruj'}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLoginMode(!isLoginMode)}
        className="switch-mode"
      >
        {isLoginMode 
          ? 'Nie masz konta? Zarejestruj się' 
          : 'Masz już konto? Zaloguj się'}
      </button>
    </div>
  );
};

export default AuthForm;