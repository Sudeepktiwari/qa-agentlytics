"use client";

import { usePathname } from "next/navigation";

export default function WidgetScript() {
  const pathname = usePathname();

  // Don't render the widget on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <script
      src="/api/widget"
      data-api-key={process.env.NEXT_PUBLIC_BOT_KEY}
    >  data-size="large"
      data-voice-enabled="false"
      data-voice-gender="female"
      data-auto-open-proactive="true"
    ></script>
  );
}
