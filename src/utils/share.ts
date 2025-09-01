export const handleShareContent = async (title: string, text: string, url: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      return false;
    }
  } else {
    // Fallback to copying to clipboard
    try {
      const shareText = `${title}\n\n${text}\n\n${url}`;
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
};
