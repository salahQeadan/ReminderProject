import React, { useState, useEffect } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'en-US';

const VoiceCommand = ({ onCommand }) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      onCommand(speechToText);
    };

    recognition.onend = () => {
      setListening(false);
    };
  }, [onCommand]);

  const startListening = () => {
    setListening(true);
    recognition.start();
  };

  const stopListening = () => {
    setListening(false);
    recognition.stop();
  };

  return (
    <div>
      <button onClick={listening ? stopListening : startListening}>
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
};

export default VoiceCommand;
