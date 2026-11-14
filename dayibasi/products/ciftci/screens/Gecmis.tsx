"use client";
import { HistoryScreen } from "@/core/activity/HistoryScreen";
import { useBack } from "@/core/shell/TabShell";
import { describe } from "../activityText";

/** Geçmiş: "Geri" geldiği ekrana döner (her ekranın üstündeki "Geçmiş"ten açılır). */
export default function Gecmis() {
  const back = useBack();
  return <HistoryScreen describe={describe} onBack={() => back()} />;
}
