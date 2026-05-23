"use client";

import { useMemo } from "react";
import type { RaceControlMessages } from "../types/timing.types";
import { cn } from "@/shared/lib/utils";
import { MessageSquare } from "lucide-react";

interface Props {
  messages?: RaceControlMessages;
}

const FLAG_COLORS: Record<string, string> = {
  GREEN: "text-green-500",
  YELLOW: "text-yellow-400",
  RED: "text-red-500",
  BLUE: "text-blue-400",
  CHEQUERED: "text-foreground",
  SC: "text-yellow-400",
  VSC: "text-yellow-300",
  CLEAR: "text-green-400",
};

export function RaceControlFeed({ messages }: Props) {
  const sorted = useMemo(() => {
    if (!messages?.Messages) return [];
    return Object.entries(messages.Messages)
      .map(([key, msg]) => ({ key, ...msg }))
      .sort((a, b) => {
        // Sort by key descending (newest first)
        return Number(b.key) - Number(a.key);
      })
      .slice(0, 20);
  }, [messages]);

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3 flex flex-col h-auto">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <MessageSquare className="w-3.5 h-3.5" />
        Race Control
      </h3>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-xs py-2">No messages yet</p>
      ) : (
        <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
          {sorted.map((msg) => {
            const flagColor = msg.Flag ? (FLAG_COLORS[msg.Flag] ?? "") : "";
            return (
              <div
                key={msg.key}
                className="text-xs border-l-2 border-muted pl-2 py-0.5 space-y-0.5"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  {msg.Lap && <span>Lap {msg.Lap}</span>}
                  {msg.Category && (
                    <span className={cn("font-semibold uppercase", flagColor)}>
                      {msg.Flag ?? msg.Category}
                    </span>
                  )}
                </div>
                {msg.Message && (
                  <p
                    className={cn(
                      "leading-tight",
                      flagColor || "text-foreground",
                    )}
                  >
                    {msg.Message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
