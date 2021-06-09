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

// name for the section time when you choose one in the popup
export function formatName(name) {
  switch (name) {
    default:
      return (
        name.split(":")[name.split(":").length - 1].replace(/_/g, " ") ||
        "unlabled"
      );
  }
}

export const importComp = (path) => {
    return () => import(`@/sections${path}.vue`)
    .catch(err => import(`../src/configs${path}.vue`)
    .catch(err => {throw new Error(`vue-sections: can't find the file in your filesystem: @/sections${path}.vue`)})
    )
  }

export const sectionHeader = (header) => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000 + 1);
  const header_key = `project-id-${timestamp}-${random}`;
  header[header_key] = "a3b2cd1";
  if(header.origin){
    header['access-control-request-headers'] = header_key;
  }
  return header
}