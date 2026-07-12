'use client';

import dynamic from 'next/dynamic';

// The chat widget is client-only and not needed for first paint or SEO, so
// defer loading its bundle until after hydration.
const ChatAgent = dynamic(() => import('./ChatAgent'), { ssr: false });

export default function ChatAgentLoader() {
  return <ChatAgent />;
}
