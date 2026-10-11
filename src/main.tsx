import React from "react";
import ReactDOM from "react-dom/client";
import { KeluarApp } from "@/components/keluar-app";
import { Toaster } from "sonner";
import "@/styles.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <KeluarApp />
      <Toaster
        position="top-center"
        toastOptions={{
          className:
            "bg-card text-card-foreground border border-border shadow-card",
        }}
      />
    </React.StrictMode>,
  );
}
