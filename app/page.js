import Image from "next/image";
import WorldMap from "@/components/WorldMap";
export default function Home() {
  return (
    <div className="h-screen">
      <main className="w-full h-full flex items-center justify-center">
        <WorldMap />
      </main>
    </div>
  );
}
