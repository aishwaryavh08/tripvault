const TOAST_ID = "tripvault-toast-container";

function ensureContainer() {
  let container = document.getElementById(TOAST_ID);

  if (!container) {
    container = document.createElement("div");
    container.id = TOAST_ID;
    container.className = "tripvault-toast-container";
    document.body.appendChild(container);
  }

  return container;
}

export function showToast(message, type = "success") {
  const container = ensureContainer();
  const toast = document.createElement("div");
  toast.className = `tripvault-toast tripvault-toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  window.setTimeout(() => {
    toast.classList.remove("visible");
    window.setTimeout(() => toast.remove(), 250);
  }, 3000);
}
