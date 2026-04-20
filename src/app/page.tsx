import { HomeShell } from "@/components/HomeShell";
import { getReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const reports = getReports();
  return <HomeShell reports={reports} />;
}
