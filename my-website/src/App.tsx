import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from './components/Navbar';
import DashboardPage from './components/DashboardPage';
import DataTablePage from './components/DataTablePage';
import LoginPage from './components/LoginPage';
import { Personel, HedefNisbet, GunlukArtis } from './lib/firebase';
import HomePage from './components/HomePage';
import HedefNisbetPage from './components/HedefNisbetPage';
import GunlukArtisYuzdesiPage from './components/GunlukArtisYuzdesiPage';

type TableRowType = string[];

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<TableRowType[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      setUser(user);
      if (!user) {
        setRows([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        console.log('No user, skipping data fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching data for user:', user.uid);

        const db = getFirestore();
        const userUid = user.uid;

        // Personel verilerini çek
        const personelQuery = query(
          collection(db, 'personel'),
          where('userId', '==', userUid)
        );
        const personelSnapshot = await getDocs(personelQuery);
        const personelList = personelSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Personel[];
        console.log('Fetched personel:', personelList);

        // Hedef nisbet verilerini çek
        const hedefQuery = query(
          collection(db, 'hedef_nisbet'),
          where('userId', '==', userUid)
        );
        const hedefSnapshot = await getDocs(hedefQuery);
        const hedefNisbetList = hedefSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as HedefNisbet[];
        console.log('Fetched hedef nisbet:', hedefNisbetList);

        // Günlük artış verilerini çek
        const artisQuery = query(
          collection(db, 'gunluk_artis'),
          where('userId', '==', userUid)
        );
        const artisSnapshot = await getDocs(artisQuery);
        const gunlukArtisList = artisSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GunlukArtis[];
        console.log('Fetched gunluk artis:', gunlukArtisList);

        // Verileri birleştir ve formatla
        const formattedRows = personelList.map(personel => {
          // Bu personel için hedef nisbet ve günlük artış verilerini bul
          const hedefNisbet = hedefNisbetList.find(hn => hn.personelId === personel.id);
          const gunlukArtis = gunlukArtisList.find(ga => ga.personelId === personel.id);

          console.log('Matching data for personel:', personel.id, {
            hedefNisbet,
            gunlukArtis
          });

          // Verileri birleştir
          return [
            personel.id!, // Firebase ID
            personel.personelNo || '',
            personel.departman?.split(' - ')[0] || '', // FAALİYET TİP
            `${personel.ad} ${personel.soyad}`.trim(), // AD SOYAD
            personel.departman?.split(' - ')[1] || '', // TİP
            gunlukArtis?.artis?.toString() || '0', // TOPLAM
            hedefNisbet?.hedefDegeri?.toString() || '0', // HEDEF
            hedefNisbet?.nisbet ? `${hedefNisbet.nisbet}%` : '0%', // HEDEF NİSBETİ
            hedefNisbet?.tarih || '' // Tarih
          ];
        });

        console.log('Formatted rows:', formattedRows);
        setRows(formattedRows);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Router>
      <div>
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/" element={!user ? <Navigate to="/login" /> : <HomePage />} />
          <Route path="/dashboard" element={!user ? <Navigate to="/login" /> : <DashboardPage rows={rows} />} />
          <Route path="/data-table" element={!user ? <Navigate to="/login" /> : <DataTablePage rows={rows} />} />
          <Route path="/hedef-nisbet" element={!user ? <Navigate to="/login" /> : <HedefNisbetPage rows={rows} />} />
          <Route path="/gunluk-artis" element={!user ? <Navigate to="/login" /> : <GunlukArtisYuzdesiPage rows={rows} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
