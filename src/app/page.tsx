import { getContent } from "@/lib/content";
import SiteView from "@/components/SiteView";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <SiteView c={await getContent()} />;
}