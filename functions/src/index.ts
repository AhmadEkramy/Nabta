import * as admin from 'firebase-admin';
import { reconcileCircleMembersCount, reconcileSpecificCircle } from './circles';

// Initialize Firebase Admin
admin.initializeApp();

// Export the functions
export {
  reconcileCircleMembersCount,
  reconcileSpecificCircle,
};
