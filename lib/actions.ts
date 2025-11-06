

export const playNotificationSound = () => {
    const audio=new Audio('/new-notification-3-398649.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
