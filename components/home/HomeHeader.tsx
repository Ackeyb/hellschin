import { labels } from "@/lib/game/labels";

export default function HomeHeader() {
  return (
    <header className="home-header">
      <h1>{labels.appTitle}</h1>
      <p>{labels.appSubtitle}</p>
    </header>
  );
}
