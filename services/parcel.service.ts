import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Parcel, ParcelFormData } from '@/types';
import { nowISO } from '@/utils/date';

const COLLECTION = 'parcels';

export async function getParcels(farmerId: string): Promise<Parcel[]> {
  const q = query(
    collection(db, COLLECTION),
    where('farmerId', '==', farmerId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Parcel);
}

export async function getParcel(id: string): Promise<Parcel | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Parcel;
}

export async function createParcel(
  farmerId: string,
  data: ParcelFormData,
): Promise<Parcel> {
  const now = nowISO();
  const parcel = {
    ...data,
    farmerId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, COLLECTION), parcel);
  return { id: ref.id, ...parcel };
}

export async function updateParcel(
  id: string,
  data: Partial<ParcelFormData>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: nowISO(),
  });
}

export async function deleteParcel(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
