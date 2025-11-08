

export const playNotificationSound = () => {
    const audio=new Audio('/pop-bottle-opening-mechanical-wave-11-00-00.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
