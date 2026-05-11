import { useEffect, useRef } from "react";

interface AvatarArrowSoundProps {
  src: string;
  volume?: number;
}

const AvatarArrowSound: React.FC<AvatarArrowSoundProps> = ({
  src,
  volume = 0.5,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAvatarArrowSound = () => {
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
      console.warn("[AvatarArrowSound] Não foi possível tocar o áudio");
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
    if (!window.__avatarSounds) {
      window.__avatarSounds = {};
    }
    window.__avatarSounds.playAvatarArrowSound = playAvatarArrowSound;

    return () => {
      delete window.__avatarSounds?.playAvatarArrowSound;
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

export default AvatarArrowSound;

declare global {
  interface Window {
    __avatarSounds?: {
      playAvatarArrowSound?: () => void;
    };
  }
}