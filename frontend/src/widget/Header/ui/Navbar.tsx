import Link from "next/link";
import DriversDropdownMenu from "./DriversDropdownMenu";
import TeamsDropdownMenu from "./TeamsDropdownMenu";
export default function Navbar() {
  return (
    <nav className="flex gap-6 ">
      <Link href="/">Standings</Link>
      <DriversDropdownMenu />
      <TeamsDropdownMenu />
      <Link href="/">Seasons</Link>
      <Link href="/">Results</Link>
      <Link href="/">Races</Link>
    </nav>
  );
}
