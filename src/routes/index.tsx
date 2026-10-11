import { createFileRoute } from "@tanstack/react-router";
import { KeluarApp } from "@/components/keluar-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <KeluarApp />;
}
