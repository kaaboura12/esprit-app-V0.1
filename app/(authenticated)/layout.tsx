"use client"

import { SideNavLayout } from '@/presentation/components/SideNavLayout'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SideNavLayout>{children}</SideNavLayout>
} 