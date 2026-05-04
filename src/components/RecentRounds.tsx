
"use client"

import { type Round } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar } from "lucide-react"
import { useUser, useFirestore, useCollection } from "@/firebase"
import { collection, query, orderBy, limit, doc, deleteDoc } from "firebase/firestore"
import { useMemoFirebase } from "@/firebase/firestore/use-collection"
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function RecentRounds({ refreshTrigger }: { refreshTrigger: number }) {
  const { user } = useUser();
  const db = useFirestore();

  const roundsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'rounds'),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [db, user]);

  const { data: roundsData, loading } = useCollection(roundsQuery);
  const rounds = (roundsData || []) as Round[];

  const handleDelete = (id: string) => {
    if (!db || !user) return;
    if (confirm('Delete this round?')) {
      const docRef = doc(db, 'users', user.uid, 'rounds', id);
      deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Syncing data...</div>;

  if (rounds.length === 0) return (
    <div className="text-center p-8 bg-card rounded-lg border border-dashed border-white/10">
      <p className="text-muted-foreground text-sm">No rounds recorded yet.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recent Rounds</h3>
      {rounds.map((round) => (
        <Card key={round.id} className="bg-card border-white/5 overflow-hidden group">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/20 text-primary font-bold rounded-lg w-12 h-12 flex items-center justify-center text-lg">
                {round.grossScore}
              </div>
              <div>
                <h4 className="font-bold text-sm truncate max-w-[150px]">{round.courseName}</h4>
                <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-tighter">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(round.date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right mr-4 hidden sm:block">
                <p className="text-[10px] text-muted-foreground uppercase">Net Score</p>
                <p className="font-bold text-sm">{round.grossScore - Math.round((round.par - 72))}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(round.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
