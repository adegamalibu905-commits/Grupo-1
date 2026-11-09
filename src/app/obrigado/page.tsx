import { getContent } from "@/lib/content";
import ThanksView from "@/components/ThanksView";

export const dynamic = "force-dynamic";

export default async function Obrigado() {
  return <ThanksView c={await getContent()} />;
}