import * as functions from 'firebase-functions';
import// Helper function to get all member IDs for a circle
async function getMemberIds(db: admin.firestore.Firestore, circleId: string): Promise<string[]> {
  const membersSnapshot = await db
    .collection('circleMembers')
    .where('circleId', '==', circleId)
    .select('userId')
    .get();

  return membersSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => doc.data().userId);
}

interface ReconcileData {
  circleId: string;
}

// Function to manually trigger reconciliation for a specific circle
export const reconcileSpecificCircle = functions.https.onCall(async (data: ReconcileData, context: functions.https.CallableContext) => {rom 'firebase-admin';

// Run once per day to reconcile circle member counts
export const reconcileCircleMembersCount = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    const circles = await db.collection('circles').get();
    
    let currentBatch = db.batch();
    let updatedCount = 0;
    let batchCount = 0;

    for (const circleDoc of circles.docs) {
      const circleId = circleDoc.id;
      
      // Get all members for this circle
      const membersSnapshot = await db
        .collection('circleMembers')
        .where('circleId', '==', circleId)
        .count()
        .get();

      const actualCount = membersSnapshot.data().count;
      const currentCount = circleDoc.data().members || 0;
      
      // Update if count is different
      if (actualCount !== currentCount) {
        console.log(`Fixing member count for circle ${circleId}: ${currentCount} → ${actualCount}`);
        currentBatch.update(circleDoc.ref, { 
          members: actualCount,
          memberIds: await getMemberIds(db, circleId)
        });
        updatedCount++;
        batchCount++;
      }

      // If batch is getting large, commit it and start a new one
      if (batchCount === 500) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchCount = 0;
      }
    }

    // Commit any remaining updates
    if (batchCount > 0) {
      await currentBatch.commit();
    }

    console.log(`Reconciled member counts for ${updatedCount} circles`);
    return { updatedCircles: updatedCount };
  });

// Helper function to get all member IDs for a circle
async function getMemberIds(db: admin.firestore.Firestore, circleId: string): Promise<string[]> {
  const membersSnapshot = await db
    .collection('circleMembers')
    .where('circleId', '==', circleId)
    .select('userId')
    .get();

  return membersSnapshot.docs.map(doc => doc.data().userId);
}

// Optional: Function to manually trigger reconciliation for a specific circle
export const reconcileSpecificCircle = functions.https.onCall(async (data, context) => {
  // Check if user is admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can trigger manual reconciliation'
    );
  }

  const { circleId } = data;
  if (!circleId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Circle ID is required'
    );
  }

  const db = admin.firestore();
  
  // Get all members for this circle
  const [membersSnapshot, circleDoc] = await Promise.all([
    db.collection('circleMembers')
      .where('circleId', '==', circleId)
      .count()
      .get(),
    db.collection('circles').doc(circleId).get()
  ]);

  if (!circleDoc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Circle not found'
    );
  }

  const actualCount = membersSnapshot.data().count;
  const currentCount = circleDoc.data()?.members || 0;

  if (actualCount !== currentCount) {
    // Update the circle document
    await circleDoc.ref.update({
      members: actualCount,
      memberIds: await getMemberIds(db, circleId)
    });

    return {
      success: true,
      previousCount: currentCount,
      newCount: actualCount
    };
  }

  return {
    success: true,
    message: 'No update needed',
    count: currentCount
  };
});
