import { useEffect, useRef } from "react";

interface KeyboardSoundProps {
  src: string;
  volume?: number;
  debounceDelay?: number;
}

const KeyboardSound: React.FC<KeyboardSoundProps> = ({
  src,
  volume = 0.5,
  debounceDelay = 750, // 0.75 segundos
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    const handleKeyDown = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (!isPlayingRef.current) {
        audio.currentTime = 0; 
        audio.play().catch(() => {
          console.warn("[KeyboardSound] Não foi possível tocar o áudio");
        });
        isPlayingRef.current = true;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (audio) {
          audio.pause();
          isPlayingRef.current = false;
        }
      }, debounceDelay);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceDelay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume)); 
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      src={src}
      style={{ display: "none" }}
      preload="auto"
    />
  );
};

export default KeyboardSound;
