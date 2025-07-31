

export const playNotificationSound = () => {
    const audio=new Audio('/update-notification.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
