import Image from "next/image";
import WorldMap from "@/components/WorldMap";
export default function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center">
      <WorldMap />
    </main>
  );
}
