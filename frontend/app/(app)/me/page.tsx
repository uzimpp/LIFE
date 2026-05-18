import { getUser } from "@/lib/user";
import { MeClient } from "./MeClient";

export default async function MePage() {
  // Auth is already enforced by (app)/layout.tsx — getUser() will not be null here.
  const user = await getUser();
  return <MeClient user={user!} />;
}
