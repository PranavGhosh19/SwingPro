
"use client"

import { DashboardLayout } from "@/components/DashboardLayout"
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase"
import { doc } from "firebase/firestore"
import { UserProfile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"

export default function SettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  if (!userProfile) return null;
  const isClub = userProfile.role === 'club';

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">System Protocol</h2>
        <div className="glass-panel rounded-[2rem] p-10 space-y-4">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Active Identity</p>
          <h3 className="text-4xl font-black italic">{isClub ? userProfile.clubName : userProfile.fullName}</h3>
          <p className="text-primary font-bold">
            {userProfile.email} • {userProfile.role?.toUpperCase() || 'IDENTITY UNKNOWN'}
          </p>
        </div>
        <Button variant="outline" className="w-full h-16 rounded-2xl border-white/10 hover:bg-destructive/10 text-destructive font-black uppercase tracking-widest" onClick={() => signOut(auth!)}>
          Terminate Session
        </Button>
      </div>
    </DashboardLayout>
  );
}
