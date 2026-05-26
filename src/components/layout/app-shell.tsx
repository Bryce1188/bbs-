"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Home, LayoutGrid, MessageCircle, PenSquare, Search, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SettingsPanel } from "@/components/layout/settings-panel";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RouteTransition } from "@/components/motion/route-transition";
import { useI18n } from "@/components/providers/i18n-provider";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ThreeBackground = dynamic(
  () => import("@/components/layout/three-background").then((mod) => mod.ThreeBackground),
  { ssr: false }
);

const navItems = [
  { href: "/", key: "home", icon: Home },
  { href: "/boards", key: "boards", icon: LayoutGrid },
  { href: "/rankings", key: "rankings", icon: Trophy },
  { href: "/messages", key: "messages", icon: MessageCircle },
  { href: "/guide", key: "guide", icon: Compass }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-screen overflow-hidden">
      <NavigationProgress />
      <ThreeBackground />
      <div className="fixed inset-0 -z-10 line-grid bg-[linear-gradient(180deg,hsl(var(--background)/0.6),hsl(var(--muted)/0.2),hsl(var(--background)/0.6))]" />
      <div className="fixed left-0 right-0 top-0 z-40 border-b bg-background/75 backdrop-blur-xl md:backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              B
            </span>
            <span className="hidden text-base font-semibold sm:inline">BBS 星桥社区</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  isActive(item.href) && "bg-muted text-foreground"
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="glass" size="icon" aria-label={t("search")}>
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="icon" aria-label={t("notifications")}>
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            <LanguageToggle />
            <ThemeToggle />
            <SettingsPanel />
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/publish">
                <PenSquare className="h-4 w-4" />
                {t("publish")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="hidden lg:inline-flex">
              <Link href="/admin">
                <ShieldCheck className="h-4 w-4" />
                {t("admin")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <main className="pb-20 pt-16 md:pb-0">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <nav aria-label="移动端主导航" className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/85 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <footer className="border-t bg-background/70 py-8 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{t("footerSummary")}</p>
          <div className="flex gap-4">
            <Link href="/admin" className="hover:text-foreground">
              {t("admin")}
            </Link>
            <Link href="/guide" className="hover:text-foreground">
              {t("userGuide")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
