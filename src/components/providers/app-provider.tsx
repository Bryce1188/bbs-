"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { Toaster } from "sonner";
import { I18nProvider } from "@/components/providers/i18n-provider";

export function AppProvider({ children, initialLocale = "zh-CN" }: { children: ReactNode; initialLocale?: "zh-CN" | "en-US" }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider initialLocale={initialLocale}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        <Toaster richColors position="top-center" />
      </I18nProvider>
    </ThemeProvider>
  );
}
