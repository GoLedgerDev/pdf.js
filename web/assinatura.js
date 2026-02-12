const assinatura = document.getElementById("carimbo");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

if (assinatura) {
  assinatura.draggable = true;
  assinatura.style.position = "absolute";
  assinatura.style.cursor = "move";

  assinatura.addEventListener("dragstart", e => {
    isDragging = true;
    const rect = assinatura.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.dataTransfer.effectAllowed = "move";
  });

  document.addEventListener("dragover", e => {
    if (isDragging) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  });

  document.addEventListener("drop", e => {
    e.preventDefault();
    const parent = assinatura.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    const x = e.clientX - parentRect.left - offsetX + parent.scrollLeft;
    const y = e.clientY - parentRect.top - offsetY + parent.scrollTop;
    assinatura.style.left = x + "px";
    assinatura.style.top = y + "px";
    sendSignaturePosition();
    isDragging = false;
  });

  document.addEventListener("click", e => {
    const parent = assinatura.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    const rect = assinatura.getBoundingClientRect();
    const centerOffsetX = rect.width / 2;
    const centerOffsetY = rect.height / 2;
    const x = e.clientX - parentRect.left - centerOffsetX + parent.scrollLeft;
    const y = e.clientY - parentRect.top - centerOffsetY + parent.scrollTop;
    assinatura.style.left = x + "px";
    assinatura.style.top = y + "px";
    sendSignaturePosition();
  });

  assinatura.addEventListener("dragend", () => {
    isDragging = false;
  });
}

const sendSignaturePosition = () => {
  const position = getSignaturePosition();
  window.top.postMessage(position, "*");
};

const getSignaturePosition = () => {
  const pages = document.getElementsByClassName("page");
  const assinaturaRect = assinatura.getBoundingClientRect();

  for (const page of pages) {
    const pageRect = page.getBoundingClientRect();

    if (isValidSignPosition(assinaturaRect, pageRect)) {
      const pageNumber = page.getAttribute("data-page-number");
      const x = assinaturaRect.left - pageRect.left;
      const y = assinaturaRect.top - pageRect.top;

      return {
        type: "signaturePosition",
        isValid: true,
        position: {
          x: x,
          y: y,
          page: pageNumber,
        },
      };
    }
  }
  console.warn("Assinatura fora do documento");
  return { isValid: false, position: null };
};

function isValidSignPosition(signRect, pageRect) {
  return (
    signRect.top >= pageRect.top &&
    signRect.right <= pageRect.right &&
    signRect.bottom <= pageRect.bottom &&
    signRect.left >= pageRect.left
  );
}
