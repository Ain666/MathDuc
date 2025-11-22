import { useRef, useCallback } from 'react';

// Đã khắc phục sự cố nhạc chờ.
// Sử dụng nguồn nhạc đáng tin cậy từ Internet Archive, có bật CORS để đảm bảo chức năng hoạt động ổn định.
// Nhạc: "White Lilies" - một bản piano thư giãn.
// Nguồn: Internet Archive
const MUSIC_URL = 'https://archive.org/download/Peaceful_and_Relaxing_Piano_Music-White_Lilies/Peaceful%20and%20Relaxing%20Piano%20Music-%20White%20Lilies.mp3';


export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioElement = useCallback(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio(MUSIC_URL);
      audio.loop = true;
      audio.volume = 0.5; // Đặt âm lượng nền dễ chịu
      
      audio.addEventListener('error', () => {
        if (audio.error) {
            console.error(`Lỗi nhạc nền: ${audio.error.message} (Mã lỗi: ${audio.error.code})`);
        } else {
            console.error("Đã xảy ra lỗi không xác định với phần tử nhạc nền.");
        }
      });
      
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const playMusic = useCallback(() => {
    const audio = getAudioElement();
    if (audio) {
      // Phương thức play() trả về một Promise. Việc xử lý nó sẽ ngăn các lỗi từ chối promise không được xử lý.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Tự động phát đã bị chặn. Đây là một chính sách phổ biến của trình duyệt.
          console.warn("Không thể phát nhạc nền:", error);
        });
      }
    }
  }, [getAudioElement]);

  const stopMusic = useCallback(() => {
    const audio = getAudioElement();
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Đặt lại cho lần phát tiếp theo
    }
  }, [getAudioElement]);

  return { playMusic, stopMusic };
};