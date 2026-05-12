import { useCallback, useEffect, useRef } from "react";

interface HoverSoundProps {
  src: string;
  volume?: number;
}

const HoverSound: React.FC<HoverSoundProps> = ({
  src,
  volume = 0.5,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playHoverSound = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Cria uma cópia do áudio para tocar sem interrupção
    const audioClone = audio.cloneNode(true) as HTMLAudioElement;
    audioClone.volume = Math.max(0, Math.min(1, volume));
    audioClone.currentTime = 0;
    
    // Remove a cópia do DOM após terminar de tocar
    audioClone.onended = () => {
      audioClone.remove();
    };
    
    document.body.appendChild(audioClone);
    audioClone.play().catch(() => {
      console.warn("[HoverSound] Não foi possível tocar o áudio");
      audioClone.remove();
    });
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (!window.__hoverSounds) {
      window.__hoverSounds = {};
    }
    window.__hoverSounds.playHoverSound = playHoverSound;

    return () => {
      delete window.__hoverSounds?.playHoverSound;
    };
  }, [playHoverSound]);

  return (
    <audio
      ref={audioRef}
      src={src}
      style={{ display: "none" }}
      preload="auto"
    />
  );
};

export default HoverSound;


declare global {
  interface Window {
    __hoverSounds?: {
      playHoverSound?: () => void;
    };
  }
}
