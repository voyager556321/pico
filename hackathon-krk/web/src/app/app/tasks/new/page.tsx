import { NewTaskPage } from "@/components/app/NewTaskPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ brief?: string }>;
}) {
  const { brief = "" } = await searchParams;
  return <NewTaskPage initialBrief={brief} />;
}
