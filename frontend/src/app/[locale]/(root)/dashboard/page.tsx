"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle, ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/**
 * Dashboard Page
 * Refactored to "The Sovereign Workspace" design system (Architectural Minimalist).
 * Implements "No-Line" boundaries, tonal layering, and signature brand gradients.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="headline-md text-primary">
            {t('welcome', { name: user?.name || '' })}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">{t('subtitle')}</p>
        </div>
        <Link href="/requests/new">
          <Button className="btn-primary flex items-center gap-2 group shadow-ambient">
            {tCommon('newRequest')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Supervisor High-Priority Area (Architectural Layering) */}
      {user?.role === "Supervisor" && (
        <div className="relative overflow-hidden bg-surface-container-low rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-ambient">
          {/* Vertical Pill Indicator (Status Bleed) */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-lg" />
          
          <div className="flex items-start gap-5">
            <div className="p-3 bg-surface-container-lowest rounded-lg shadow-ambient">
              <AlertCircle className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-primary leading-tight">
                {t('pendingApprovals')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('pendingDescription', { count: 3 })}
              </p>
            </div>
          </div>
          
          <Link href="/approvals">
            <Button variant="ghost" className="btn-tertiary">
              {t('reviewApprovals')}
            </Button>
          </Link>
        </div>
      )}

      {/* Summary Metrics (Tonal Layering) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Calendar, label: t('vacationBalance'), value: 14, sub: t('daysAvailable') },
          { icon: AlertCircle, label: t('sickLeave'), value: 5, sub: t('daysAvailable') },
          { icon: Clock, label: t('upcomingLeaves'), value: t('noneScheduled'), isFull: true },
        ].map((item, i) => (
          <div 
            key={i} 
            className="content-card p-6 flex flex-col justify-between min-h-[160px] group transition-all hover:translate-y-[-4px]"
          >
            <div className="flex justify-between items-start">
              <span className="label-sm text-muted-foreground/80 tracking-widest">{item.label}</span>
              <div className="p-2 rounded-lg bg-surface-container-low/50 group-hover:bg-primary-container group-hover:text-white transition-colors duration-300">
                <item.icon className="w-4 h-4 text-muted-foreground/60 transition-colors" />
              </div>
            </div>
            
            <div className="mt-6">
              {typeof item.value === 'number' ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-heading tracking-tighter bg-linear-to-br from-primary to-primary-container bg-clip-text text-transparent">
                    {item.value}
                  </span>
                  <span className="label-sm text-muted-foreground/50">{t('days')}</span>
                </div>
              ) : (
                <div className="text-xl font-bold font-heading text-primary/80">
                  {item.value}
                </div>
              )}
              {item.sub && <p className="label-sm text-muted-foreground/60 mt-2 font-medium">{item.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Workspace Area: Recent Requests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
          <h2 className="text-xl font-bold font-heading text-primary">
            {t('recentRequests')}
          </h2>
          <Link href="/requests" className="label-sm hover:text-primary transition-colors flex items-center gap-2 group">
            {tCommon('viewAll')}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="bg-surface-container-low/30 rounded-lg overflow-hidden flex flex-col items-center justify-center p-12 border border-outline-variant/10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-secondary/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-6 bg-surface-container-lowest rounded-full shadow-ambient text-secondary">
              <Calendar className="w-10 h-10 opacity-40" />
            </div>
          </div>
          <div className="text-center">
            <h4 className="font-heading font-bold text-primary opacity-60 mb-1">{t('noRecentRequests')}</h4>
            <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
              {t('noRecentDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
