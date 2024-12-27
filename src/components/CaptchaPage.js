import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import '../styles/CaptchaPage.css';

const CaptchaPage = ({ onVerified }) => {
  const [isVerified, setIsVerified] = useState(false);

  const handleCaptcha = (value) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const handleProceed = () => {
    if (isVerified) {
      onVerified();
    } else {
      alert('Please verify the CAPTCHA first!');
    }
  };

  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;


  return (
    <div className="captcha-container">
      <h2>Verify You Are Human</h2>
      <ReCAPTCHA
        sitekey={siteKey}

        onChange={handleCaptcha}
      />
      <button onClick={handleProceed} disabled={!isVerified}>
        Proceed
      </button>
    </div>
  );
};

export default CaptchaPage;
