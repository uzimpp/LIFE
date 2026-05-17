import { getUser } from "@/lib/user";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const user = await getUser();
  return <NavbarClient user={user} />;
}
