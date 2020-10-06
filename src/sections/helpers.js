export const base64Img = file => {
  const reader = new FileReader();
  return new Promise(resolve => {
    reader.onload = e => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];
      resolve({
        base64,
        name: file.name,
        size: file.size,
        type: file.type,
        raw: dataUrl
      });
    };
    reader.readAsDataURL(file);
  });
};
