"use client";

import { useParams } from "next/navigation";
import { PrototypeWorkroomPage } from "@/components/app/PrototypePages";

const ROOM_TABS = new Set(["review", "conversation", "files", "activity"]);

export default function WorkroomPage() {
  const params = useParams<{ id: string; tab: string }>();
  const tab = ROOM_TABS.has(params.tab) ? params.tab : "review";
  return <PrototypeWorkroomPage taskId={params.id} tab={tab} />;
}
