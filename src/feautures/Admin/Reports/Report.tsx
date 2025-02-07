import { useEffect, useRef } from "react";
import { wait } from "../../../lib/wait";

export default function DisplayReport() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    wait(100).then(() => {
      const params = new URLSearchParams(window.location.search);
      const pdfUrl = params.get("pdf");
      if (pdfUrl) {
        if (iframeRef.current) {
          iframeRef.current.src = pdfUrl;
        }
      }
    });
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <iframe
        ref={iframeRef}
        id="reportFrame"
        style={{
          border: "none",
          width: "100%",
          height: "100vh",
        }}
      ></iframe>
    </div>
  );
}
