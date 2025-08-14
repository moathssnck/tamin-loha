

export const playNotificationSound = () => {
    const audio=new Audio('/mixkit-access-allowed-tone-2869.wav')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
