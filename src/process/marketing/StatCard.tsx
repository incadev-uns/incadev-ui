// src/components/marketing/StatCard.tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText, Calendar, Users, Megaphone, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: 'file-text' | 'calendar' | 'users' | 'megaphone';
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: {
    value: number;
    label: string;
  };
}

const iconMap: Record<StatCardProps['icon'], LucideIcon> = {
  'file-text': FileText,
  calendar: Calendar,
  users: Users,
  megaphone: Megaphone,
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900/50',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-900/50',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    gradient: 'from-purple-500 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900/50',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    gradient: 'from-orange-500 to-orange-600',
  },
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];

  return (
    <div className={'rounded-xl p-6 smooth-transition hover:shadow-lg relative overflow-hidden group border ' + colors.bg + ' ' + colors.border}>
      <div className={'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 smooth-transition ' + colors.gradient}></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className={'text-3xl font-bold ' + colors.text}>
              {value}
            </p>
          </div>
          <div className={'p-3 rounded-lg ' + colors.iconBg}>
            <Icon className={'w-6 h-6 ' + colors.text} />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {trend.value >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={trend.value >= 0 ? 'text-sm font-medium text-green-600 dark:text-green-400' : 'text-sm font-medium text-red-600 dark:text-red-400'}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}