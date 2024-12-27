import React, { useState } from 'react';
import CaptchaPage from './components/CaptchaPage';
import BookList from './components/BookList'; // Updated import
import './styles/App.css';

function App() {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerification = () => {
    setIsVerified(true);
  };

  return (
    <div className="App">
      {/* Show Captcha until verified */}
      {!isVerified ? (
        <CaptchaPage onVerified={handleVerification} />
      ) : (
        // Display BookList after verification
        <BookList />
      )}
    </div>
  );
}

export default App;
