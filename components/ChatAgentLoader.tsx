'use client';

import ChatAgent from './ChatAgent';

// The trigger button must be interactive immediately after hydration, so
// ChatAgent is imported directly (not via next/dynamic) — only its heavy
// chat window is code-split internally.
export default function ChatAgentLoader() {
  return <ChatAgent />;
}
