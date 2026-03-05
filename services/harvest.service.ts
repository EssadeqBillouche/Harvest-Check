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
import { Harvest, HarvestFormData } from '@/types';
import { nowISO } from '@/utils/date';

const COLLECTION = 'harvests';

export async function getHarvests(parcelId: string): Promise<Harvest[]> {
  const q = query(
    collection(db, COLLECTION),
    where('parcelId', '==', parcelId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest);
}

export async function getHarvestsByZone(zoneId: string): Promise<Harvest[]> {
  const q = query(
    collection(db, COLLECTION),
    where('zoneId', '==', zoneId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest);
}

export async function getHarvestsByCulture(cultureId: string): Promise<Harvest[]> {
  const q = query(
    collection(db, COLLECTION),
    where('cultureId', '==', cultureId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest);
}

export async function getAllFarmerHarvests(parcelIds: string[]): Promise<Harvest[]> {
  if (parcelIds.length === 0) return [];
  // Firestore 'in' limited to 30 values
  const batches: string[][] = [];
  for (let i = 0; i < parcelIds.length; i += 30) {
    batches.push(parcelIds.slice(i, i + 30));
  }
  const results: Harvest[] = [];
  for (const batch of batches) {
    const q = query(
      collection(db, COLLECTION),
      where('parcelId', 'in', batch),
      orderBy('date', 'desc'),
    );
    const snap = await getDocs(q);
    results.push(...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest));
  }
  return results;
}

export async function getHarvest(id: string): Promise<Harvest | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Harvest;
}

export async function createHarvest(
  parcelId: string,
  zoneId: string,
  cultureId: string,
  data: HarvestFormData,
): Promise<Harvest> {
  const now = nowISO();
  const harvest = {
    ...data,
    parcelId,
    zoneId,
    cultureId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(collection(db, COLLECTION), harvest);
  return { id: ref.id, ...harvest };
}

export async function updateHarvest(
  id: string,
  data: Partial<HarvestFormData>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: nowISO(),
  });
}

export async function deleteHarvest(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
