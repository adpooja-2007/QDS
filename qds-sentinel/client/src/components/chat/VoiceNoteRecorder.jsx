import React, { useState, useRef, useEffect } from 'react';

export default function VoiceNoteRecorder({ onFinish, onCancel }) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) return;
        streamRef.current = stream;

        // Set up Web Audio API analyser for live waveform
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Media Recorder setup
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
          else mimeType = '';
        }

        const options = mimeType ? { mimeType } : {};
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(100);

        // Timer
        timerIntervalRef.current = setInterval(() => {
          setRecordingTime((t) => t + 1);
        }, 1000);

        // Draw waveform
        drawWaveform();
      } catch (err) {
        console.error('Microphone access error:', err);
        setError('Microphone access denied or unavailable.');
      }
    };

    startRecording();

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / (bufferLength / 2)) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength / 2; i++) {
        const barHeight = Math.max(3, (dataArray[i] / 255) * canvas.height * 0.85);

        ctx.fillStyle = '#C85A32'; // Terracotta quantum signature color
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStopAndSend = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    mediaRecorderRef.current.onstop = () => {
      const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        cleanup();
        onFinish({
          audioData: base64Data,
          mimeType,
          duration: recordingTime,
          size: audioBlob.size,
          fileName: `quantum_voice_note_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    onCancel();
  };

  return (
    <div className="flex items-center gap-3 w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl px-3 py-1.5 shadcn-slide-in">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-terracotta-700">
        <span className="w-2.5 h-2.5 rounded-full bg-terracotta-600 animate-ping"></span>
        <span>REC</span>
        <span className="text-[#181B20] min-w-[40px]">{formatSeconds(recordingTime)}</span>
      </div>

      {/* Live Waveform Canvas */}
      <div className="flex-1 h-6 flex items-center justify-center overflow-hidden">
        {error ? (
          <span className="text-[11px] font-mono text-terracotta-700">{error}</span>
        ) : (
          <canvas ref={canvasRef} width={240} height={24} className="w-full h-full" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleCancel}
          className="shadcn-btn p-1.5 rounded-lg text-[#797167] hover:text-[#181B20] hover:bg-[#EAE3DA] text-xs font-mono"
          title="Cancel Voice Note"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleStopAndSend}
          disabled={recordingTime < 1 || !!error}
          className="shadcn-btn px-3 py-1 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-50 text-white text-xs font-mono font-semibold shadow-xs flex items-center gap-1.5"
          title="Sign & Send Quantum Voice Note"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
