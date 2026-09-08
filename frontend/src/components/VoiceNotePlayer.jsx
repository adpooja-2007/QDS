import React, { useState, useRef, useEffect } from 'react';

export default function VoiceNotePlayer({ audioSrc, isOutgoing = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.error('Audio play error:', e);
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Static stylized soundwave bar heights
  const bars = [4, 8, 14, 10, 16, 20, 12, 18, 14, 8, 16, 22, 18, 12, 15, 9, 14, 19, 10, 6];

  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl my-1 min-w-[240px] max-w-[320px] ${
      isOutgoing
        ? 'bg-white/10 text-white border border-white/20'
        : 'bg-[#F4EFEA] text-[#181B20] border border-[#E5DEC7]'
    }`}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {/* Play / Pause button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition hover:scale-105 active:scale-95 ${
          isOutgoing
            ? 'bg-white text-[#181B20] hover:bg-cream-100'
            : 'bg-[#181B20] text-white hover:bg-[#2C313A]'
        }`}
        title={isPlaying ? 'Pause voice note' : 'Play quantum voice note'}
      >
        {isPlaying ? (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Waveform Visualization & Slider */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-0.5 h-6 mb-1 relative cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          if (audioRef.current && duration > 0) {
            audioRef.current.currentTime = ratio * duration;
          }
        }}>
          {bars.map((h, i) => {
            const barProgress = (i / bars.length) * 100;
            const isPlayed = barProgress <= progressPct;
            return (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPlayed
                    ? (isOutgoing ? 'bg-white' : 'bg-terracotta-600')
                    : (isOutgoing ? 'bg-white/30' : 'bg-[#DDD5C8]')
                } ${isPlaying && isPlayed ? 'opacity-100' : 'opacity-85'}`}
              />
            );
          })}
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span>{formatTime(duration || 0)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
