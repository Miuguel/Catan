import { useEffect, useRef } from "react";

interface BackgroundMusicProps {
  src: string;
  volume?: number;
  loop?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}


const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src,
  volume = 0.3,
  loop = true,
  autoPlay = true,
  muted = true,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp entre 0 e 1
    audio.loop = loop;
    audio.muted = muted;

    if (autoPlay) {
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("[BackgroundMusic] Autoplay bloqueado pelo navegador:", error);
        });
      }
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [volume, loop, autoPlay, muted]);

  return (
    <audio
      ref={audioRef}
      src={src}
      muted={muted}
      style={{ display: "none" }}
      crossOrigin="anonymous"
    />
  );
};

export default BackgroundMusic;
