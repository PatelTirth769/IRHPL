import {
  Upload,
  CheckSquare,
  FileText,
  Clock,
  CalendarDays,
  FileBadge2,
  BookOpen,
  Library,
  IndianRupee,
  PlaneTakeoff,
  Percent,
  Briefcase,
  Hourglass,
  BookA,
  Scale,
  Gavel,
  Landmark,
  Building2
} from 'lucide-react';

export const SIDEBAR_MAIN_LINKS = [
  { label: 'Master Data Upload', path: '/dashboard/master-data-upload', icon: Upload, badge: 'NEW' },
  { label: 'Employee Master', path: '/dashboard/employee-master', icon: Briefcase, badge: 'NEW' },
  { label: 'Pass Management', path: '/dashboard/pass-management', icon: FileBadge2, badge: 'NEW' },
  { label: 'License Management', path: '/dashboard/license-management', icon: Landmark, badge: 'NEW' },
  { label: 'Org Management', path: '/dashboard/org-management', icon: Building2, badge: 'NEW' },
  { label: 'Checklist', path: '/checklist', icon: CheckSquare },
  { label: 'Registrations', path: '/registrations', icon: FileText },
  { label: 'Expiry Reminders', path: '/expiry-reminders', icon: Clock },
  { label: 'Audit Log', path: '/audit-log', icon: FileText, badge: 'NEW' },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
];

export const SIDEBAR_RESOURCE_LINKS = [
  { label: 'Gazette Notifications', path: '/gazette-notifications', icon: FileBadge2 },
  { label: 'Blog', path: '/blog', icon: BookOpen },
  { label: 'Knowledge Base', path: '/knowledge-base', icon: Library },
  { label: 'Holiday List', path: '/holiday-list', icon: PlaneTakeoff },
  { label: 'Working Hours', path: '/working-hours', icon: Hourglass },
  { label: 'Rules & Acts', path: '/rules-and-acts', icon: Scale },
  { label: 'Court Judgements', path: '/court-judgements', icon: Gavel, badge: 'NEW' },
];
