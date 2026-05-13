
"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { AddRoundForm } from "@/components/AddRoundForm"
import { useRouter } from "next/navigation"

export default function AddRoundPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <AddRoundForm onComplete={() => router.push('/dashboard')} />
    </DashboardLayout>
  );
}
