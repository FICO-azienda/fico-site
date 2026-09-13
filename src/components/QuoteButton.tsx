"use client";

import { openAskFico } from "./AskFico";

export default function QuoteButton({ label, ghost }: { label: string; ghost?: boolean }) {
  return (
    <button className={`btn ${ghost ? "" : "btn--solid"} magnetic`} onClick={openAskFico} data-cursor="open">
      {label}
    </button>
  );
}
