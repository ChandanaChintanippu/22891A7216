import React from 'react';
import './App.css';
import UrlShortener from "./components/UrlShortener";
function App() {
  return (
    <div className="App">
      <h1 className="text-2xl font-bold text-center mt-4">Frontend App</h1>
      <UrlShortener />
    </div>
  );
}
export default App;
