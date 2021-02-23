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

// name of the component to match the view comp name in views folder
export function getSectionViewCompName(viewName) {
  switch (viewName) {
    case "wysiwyg":
      return "Wysiwyg";
    default:
      return viewName;
  }
}
