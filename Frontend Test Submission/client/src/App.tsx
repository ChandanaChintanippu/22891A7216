import React from 'react';
import logo from './logo.svg';
import './App.css';
import { logEvent } from './middleware/logger';
function App() {
  const handleClick = () => {
    logEvent("info", "App Component", "User clicked the button");
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={handleClick}>Click Me</button>
      </header>
    </div>
  );
}
export default App;
