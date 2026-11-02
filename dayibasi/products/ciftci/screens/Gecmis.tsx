"use client";
import { HistoryScreen } from "@/core/activity/HistoryScreen";
import { useGo } from "@/core/shell/TabShell";
import { describe } from "../activityText";

export default function Gecmis() {
  const go = useGo();
  return <HistoryScreen describe={describe} onBack={() => go("ozet")} />;
}
