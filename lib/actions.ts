

export const playNotificationSound = () => {
    const audio=new Audio('/samsung_brightline.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
