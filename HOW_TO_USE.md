# Integração com React

## Hook `useSignatureFrame`

```js
import { useEffect, useRef } from "react";

type SignResponse =
  | {
      type: "viewerLoaded";
    }
  | {
      type: "signaturePosition";
      isValid: true;
      position: { x: number; y: number; page: number };
    }
  | {
      type: "signaturePosition";
      isValid: false;
      position: null;
    };

export function useSignatureFrame(props: { base64File: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const signPosition = useRef<SignResponse | null>(null);

  const sendFile = (base64File: string) => {
    if (!iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage(
      {
        type: "loadPdf",
        url: base64File,
      },
      "http:localhost:8888",
    );
  };

  useEffect(() => {
    const eventListener = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8888") return;
      switch (event.data.type) {
        case "viewerLoaded":
          console.log("Viewer loaded");
          sendFile(props.base64File);
          break;
        case "signaturePosition":
          signPosition.current = event.data;
          console.log(event.data);
          break;
        default:
          console.log("Unknown message type received:", event.data.type);
      }
    };
    window.addEventListener("message", eventListener);

    return () => {
      window.removeEventListener("message", eventListener);
    };
  }, []);

  return {
    iframeRef,
    signPosition: signPosition.current,
    sendFile,
  };
}
```

## Utilizando hook no componente

```js
function App() {
  const { iframeRef } = useSignatureFrame(base64File);
  return (
    <iframe
      ref={iframe}
      width="100%"
      height="700px"
      src="http://localhost:8888/web/viewer.html"
    ></iframe>
  );
}
```

## Fluxo de Comunicação

```
React App
   ↓
iframe (viewer.html)
   ↓
postMessage: viewerLoaded
   ↓
React envia loadPdf
   ↓
Usuário seleciona posição
   ↓
iframe envia signaturePosition
```
