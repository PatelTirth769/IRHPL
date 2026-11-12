import { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    const otpString = newOtp.join('');
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
    if (!paste) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < paste.length; i++) {
      newOtp[i] = paste[i];
    }
    setOtp(newOtp);
    
    const nextIndex = Math.min(paste.length, length - 1);
    inputRefs.current[nextIndex].focus();
    
    if (paste.length === length) {
      onComplete(paste);
    }
  };

  return (
    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
      {otp.map((value, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-14 text-center text-lg font-bold bg-white border border-slate-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
      ))}
    </div>
  );
};

export default OtpInput;
