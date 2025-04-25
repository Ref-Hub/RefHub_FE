export const getAriaLabel = (label: string, required?: boolean): string => {
  return required ? `${label} (required)` : label;
};

export const getAriaDescribedBy = (
  descriptionId?: string,
  errorId?: string
): string | undefined => {
  if (descriptionId && errorId) {
    return `${descriptionId} ${errorId}`;
  }
  return descriptionId || errorId;
};

export const getRole = (type: string): string => {
  switch (type) {
    case "button":
      return "button";
    case "link":
      return "link";
    case "checkbox":
      return "checkbox";
    case "radio":
      return "radio";
    case "text":
      return "textbox";
    default:
      return "none";
  }
};

export const getTabIndex = (disabled?: boolean): number => {
  return disabled ? -1 : 0;
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];
};

export const trapFocus = (element: HTMLElement): void => {
  const focusableElements = getFocusableElements(element);
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  element.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    }
  });
};
