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
import { Culture, CultureFormData } from '@/types';
import { nowISO } from '@/utils/date';

const COLLECTION = 'cultures';

export async function getCultures(parcelId: string): Promise<Culture[]> {
  const q = query(
    collection(db, COLLECTION),
    where('parcelId', '==', parcelId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Culture);
}

export async function getCulturesByZone(zoneId: string): Promise<Culture[]> {
  const q = query(
    collection(db, COLLECTION),
    where('zoneId', '==', zoneId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Culture);
}

export async function getCulture(id: string): Promise<Culture | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Culture;
}

export async function createCulture(
  parcelId: string,
  zoneId: string,
  data: CultureFormData,
): Promise<Culture> {
  const now = nowISO();
  const culture = {
    ...data,
    parcelId,
    zoneId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, COLLECTION), culture);
  return { id: ref.id, ...culture };
}

export async function updateCulture(
  id: string,
  data: Partial<CultureFormData>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: nowISO(),
  });
}

export async function deleteCulture(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
