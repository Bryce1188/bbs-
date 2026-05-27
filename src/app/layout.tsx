import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@/app/globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import { GuidedTour } from "@/components/motion/guided-tour";

export const metadata: Metadata = {
  title: "BBS 星桥社区",
  description: "Next.js + MySQL + Session + Socket.IO 的本地部署论坛系统。"
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("bbs-locale")?.value;
  const locale = localeCookie === "en-US" ? "en-US" : "zh-CN";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <AppProvider initialLocale={locale}>
          <AppShell>{children}</AppShell>
          <GuidedTour />
        </AppProvider>
      </body>
    </html>
  );
}
