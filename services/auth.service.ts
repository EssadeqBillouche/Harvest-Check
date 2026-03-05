import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Farmer, FarmerFormData } from '@/types';
import { nowISO } from '@/utils/date';

/** Register a new farmer account */
export async function registerFarmer(
  email: string,
  password: string,
  displayName: string,
): Promise<Farmer> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  await updateProfile(credential.user, { displayName });

  const farmer: Farmer = {
    id: uid,
    uid,
    email,
    displayName,
    phone: '',
    address: '',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  await setDoc(doc(db, 'farmers', uid), farmer);

  return farmer;
}

/** Sign in an existing farmer */
export async function signIn(email: string, password: string): Promise<Farmer> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const farmer = await getFarmerProfile(credential.user.uid);
  if (!farmer) throw new Error('Profil agriculteur introuvable');
  return farmer;
}

/** Sign out */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/** Get farmer profile from Firestore */
export async function getFarmerProfile(uid: string): Promise<Farmer | null> {
  const snap = await getDoc(doc(db, 'farmers', uid));
  if (!snap.exists()) return null;
  return snap.data() as Farmer;
}

/** Update farmer profile */
export async function updateFarmerProfile(
  uid: string,
  data: Partial<FarmerFormData>,
): Promise<void> {
  await setDoc(
    doc(db, 'farmers', uid),
    { ...data, updatedAt: nowISO() },
    { merge: true },
  );
}

/** Subscribe to auth state changes */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
