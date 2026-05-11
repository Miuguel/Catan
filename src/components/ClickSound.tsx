import { useEffect, useRef } from "react";

interface ClickSoundProps {
  src: string;
  volume?: number;
}

const ClickSound: React.FC<ClickSoundProps> = ({
  src,
  volume = 0.5,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playClickSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const audioClone = audio.cloneNode(true) as HTMLAudioElement;
    audioClone.volume = Math.max(0, Math.min(1, volume));
    audioClone.currentTime = 0;

    audioClone.onended = () => {
      audioClone.remove();
    };

    document.body.appendChild(audioClone);
    audioClone.play().catch(() => {
      console.warn("[ClickSound] Não foi possível tocar o áudio");
      audioClone.remove();
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }, [volume]);

  useEffect(() => {
    if (!window.__clickSounds) {
      window.__clickSounds = {};
    }
    window.__clickSounds.playClickSound = playClickSound;

    return () => {
      delete window.__clickSounds?.playClickSound;
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={src}
      style={{ display: "none" }}
      preload="auto"
    />
  );
};

export default ClickSound;

declare global {
  interface Window {
    __clickSounds?: {
      playClickSound?: () => void;
    };
  }
}