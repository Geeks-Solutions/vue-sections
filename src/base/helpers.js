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

export const importComp = (path,type) => {
  try {
    if (type == "internal") {
      return () => import(`../src/configs${path}`);
    } else {
      if (process.env.VUE_APP_SECTIONS_CONF) {
        return () => import(`${process.env.VUE_APP_SECTIONS_CONF}${path}`);
      } else {
        return () => import(`@/sections_config${path}`);
      }
    }
  } catch (error) {
    console.log(error)
    return
  }
}
