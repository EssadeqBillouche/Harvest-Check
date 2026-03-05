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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Zone, ZoneFormData } from '@/types';
import { nowISO } from '@/utils/date';

const COLLECTION = 'zones';

export async function getZones(parcelId: string): Promise<Zone[]> {
  const q = query(
    collection(db, COLLECTION),
    where('parcelId', '==', parcelId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Zone);
}

export async function getZone(id: string): Promise<Zone | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Zone;
}

export async function createZone(
  parcelId: string,
  data: ZoneFormData,
): Promise<Zone> {
  const now = nowISO();
  const zone = {
    ...data,
    parcelId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, COLLECTION), zone);
  return { id: ref.id, ...zone };
}

export async function updateZone(
  id: string,
  data: Partial<ZoneFormData>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: nowISO(),
  });
}

export async function deleteZone(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
