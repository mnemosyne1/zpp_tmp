import React from "react";
import ChatBox from "./components/ChatBox";
import AuthForm from './components/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  
  return (
    <div className="app">
      {user ? <ChatBox /> : <AuthForm />}
    </div>
  );
}

export default App;
