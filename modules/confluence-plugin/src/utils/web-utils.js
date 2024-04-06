export async function convert2Base64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
}

export function scrollToElement(elementId) {
  const targetElement = document.getElementById(elementId);
  //@ts-ignore
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function isUrl (str) {
  return str.toLowerCase().startsWith('http') || str.toLowerCase().startsWith('data:image');
}