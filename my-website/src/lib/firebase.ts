import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
  where,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBaLfRR0TSVg6QqvFY4tLNJJ1F5c4l92kI",
  authDomain: "vcbson-a92fc.firebaseapp.com",
  projectId: "vvcbson-a92fc",
  storageBucket: "vcbson-a92fc.firebasestorage.app",
  messagingSenderId: "35972849762",
  appId: "1:35972849762:web:40ed4e78dfdbe0de00b13b",
  measurementId: "G-2NLD6Q2NYB",
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Google provider'ı oluştur
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Koleksiyon isimleri
export const COLLECTIONS = {
  PERSONEL: "personel",
  HEDEF_NISBET: "hedef_nisbet",
  GUNLUK_ARTIS: "gunluk_artis",
  USERS: "users",
} as const;

// Tip tanımlamaları
export interface Personel {
  id?: string;
  personelNo: string;
  ad: string;
  soyad: string;
  departman: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  createdBy: string;
  userUid: string; // Users tablosundaki UID
}

export interface HedefNisbet {
  id?: string;
  personelId: string;
  nisbet: number;
  hedefDegeri: number;
  tarih: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  userUid: string; // Users tablosundaki UID
}

export interface GunlukArtis {
  id?: string;
  personelId: string;
  artis: number;
  tarih: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  userUid: string; // Users tablosundaki UID
}

// Kullanıcı tipi tanımı
export interface User {
  id?: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLogin: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Yardımcı fonksiyonlar
export async function getPersonelList(userId: string) {
  try {
    const q = query(
      collection(db, COLLECTIONS.PERSONEL),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Personel)
    );
  } catch (error) {
    console.error("Personel listesi alınırken hata:", error);
    throw new Error("Personel listesi alınamadı");
  }
}

export async function getHedefNisbetList(userId: string) {
  try {
    const q = query(
      collection(db, COLLECTIONS.HEDEF_NISBET),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as HedefNisbet)
    );
  } catch (error) {
    console.error("Hedef nisbet listesi alınırken hata:", error);
    throw new Error("Hedef nisbet listesi alınamadı");
  }
}

export async function getGunlukArtisList(userId: string) {
  try {
    const q = query(
      collection(db, COLLECTIONS.GUNLUK_ARTIS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as GunlukArtis)
    );
  } catch (error) {
    console.error("Günlük artış listesi alınırken hata:", error);
    throw new Error("Günlük artış listesi alınamadı");
  }
}

export async function createPersonel(
  data: Omit<Personel, "id" | "createdAt" | "updatedAt">
) {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.PERSONEL), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    } as Personel;
  } catch (error) {
    console.error("Personel oluşturulurken hata:", error);
    throw new Error("Personel oluşturulamadı");
  }
}

export async function createHedefNisbet(
  data: Omit<HedefNisbet, "id" | "createdAt" | "updatedAt">
) {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.HEDEF_NISBET), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    } as HedefNisbet;
  } catch (error) {
    console.error("Hedef nisbet oluşturulurken hata:", error);
    throw new Error("Hedef nisbet oluşturulamadı");
  }
}

export async function createGunlukArtis(
  data: Omit<GunlukArtis, "id" | "createdAt" | "updatedAt">
) {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.GUNLUK_ARTIS), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    } as GunlukArtis;
  } catch (error) {
    console.error("Günlük artış oluşturulurken hata:", error);
    throw new Error("Günlük artış oluşturulamadı");
  }
}

// Silme fonksiyonları
export async function deletePersonel(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PERSONEL, id));
  } catch (error) {
    console.error("Personel silinirken hata:", error);
    throw new Error("Personel silinemedi");
  }
}

export async function deleteHedefNisbet(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HEDEF_NISBET, id));
  } catch (error) {
    console.error("Hedef nisbet silinirken hata:", error);
    throw new Error("Hedef nisbet silinemedi");
  }
}

export async function deleteGunlukArtis(id: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GUNLUK_ARTIS, id));
  } catch (error) {
    console.error("Günlük artış silinirken hata:", error);
    throw new Error("Günlük artış silinemedi");
  }
}

// Personel ID'sine göre ilgili nisbet ve artış kayıtlarını silmek için fonksiyonlar (İsteğe bağlı, Firebase'de cascade delete manuel yapılır)
/*
export async function deleteHedefNisbetByPersonelId(personelId: string) {
  try {
    const q = query(collection(db, COLLECTIONS.HEDEF_NISBET), where('personelId', '==', personelId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, COLLECTIONS.HEDEF_NISBET, d.id)));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Personel ID'sine göre hedef nisbet silinirken hata:', error);
    throw new Error('İlgili hedef nisbet kayıtları silinemedi');
  }
}

export async function deleteGunlukArtisByPersonelId(personelId: string) {
  try {
    const q = query(collection(db, COLLECTIONS.GUNLUK_ARTIS), where('personelId', '==', personelId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, COLLECTIONS.GUNLUK_ARTIS, d.id)));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Personel ID'sine göre günlük artış silinirken hata:', error);
    throw new Error('İlgili günlük artış kayıtları silinemedi');
  }
}
*/

// Kullanıcı oluşturma/güncelleme fonksiyonu
export async function createOrUpdateUser(
  userData: Omit<User, "id" | "createdAt" | "updatedAt">
) {
  try {
    const now = Timestamp.now();
    const userRef = doc(db, COLLECTIONS.USERS, userData.uid);

    // Kullanıcı var mı kontrol et
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Kullanıcı varsa güncelle
      await updateDoc(userRef, {
        ...userData,
        lastLogin: now,
        updatedAt: now,
      });
      return {
        id: userDoc.id,
        ...userData,
        lastLogin: now,
        updatedAt: now,
      } as User;
    } else {
      // Kullanıcı yoksa yeni oluştur
      await setDoc(userRef, {
        ...userData,
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id: userData.uid,
        ...userData,
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      } as User;
    }
  } catch (error) {
    console.error("Kullanıcı oluşturulurken/güncellenirken hata:", error);
    throw new Error("Kullanıcı işlemi başarısız oldu");
  }
}

// Kullanıcı bilgilerini getirme fonksiyonu
export async function getUser(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken hata:", error);
    throw new Error("Kullanıcı bilgileri alınamadı");
  }
}

// Auth işlemleri
export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  await signOut(auth);
}
