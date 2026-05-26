"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN";

  return (
    <Button variant="glass" size="sm" aria-label={`切换语言到 ${nextLocale}`} onClick={() => setLocale(nextLocale)}>
      <Languages className="h-4 w-4" />
      {locale === "zh-CN" ? "中文" : "EN"}
    </Button>
  );
}
