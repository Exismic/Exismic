"use client";

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { safeAnalyticsEvent } from '@/lib/analytics-privacy';

export function SafeSiteAnalytics() {
  return <><Analytics beforeSend={safeAnalyticsEvent} /><SpeedInsights beforeSend={safeAnalyticsEvent} /></>;
}
