import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Checkbox, TablePagination, IconButton, CircularProgress, Input } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { createPersonel, createHedefNisbet, createGunlukArtis, deletePersonel } from '../lib/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

type TableRowType = string[];

// Başlıklar görsele göre güncellendi
const TABLE_HEADERS = [
  'PersonelNO',
  'FAALİYET TİP',
  'AD SOYAD',
  'TİP',
  'TOPLAM',
  'HEDEF',
  'HEDEF NİSBETİ',
];

function DataTablePage({ rows }: { rows: TableRowType[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false); // Tek veri ekleme dialogu
  const [bulkOpen, setBulkOpen] = useState(false); // Toplu veri ekleme dialogu
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [newRow, setNewRow] = useState({
    personelNo: '', // Yeni eklenen personelNo alanı
    ad: '',
    soyad: '',
    departman: '',
    nisbet: '',
    artis: '',
    tarih: new Date().toISOString().split('T')[0]
  });
  const [bulkData, setBulkData] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]); // Seçili satırların ID'leri
  // Toplu yükleme için tarih state'i eklendi
  const [bulkUploadDate, setBulkUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('DataTablePage - Auth state changed:', user?.uid);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log('DataTablePage - Received rows:', rows);
  }, [rows]);

  const handleAddRow = async () => {
    if (!user) {
      setError('Kullanıcı girişi yapılmamış. Lütfen tekrar giriş yapın.');
      setSnackbarOpen(true);
      return;
    }

    if (!newRow.personelNo || !newRow.ad || !newRow.soyad || !newRow.departman) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Once personel olustur
      const personel = await createPersonel({
        userId: user.uid,
        personelNo: newRow.personelNo,
        ad: newRow.ad,
        soyad: newRow.soyad,
        departman: newRow.departman,
        createdBy: user.uid,
        userUid: user.uid
      });

      // Sonra hedef nisbet olustur
      await createHedefNisbet({
        userId: user.uid,
        personelId: personel.id!,
        nisbet: parseFloat(newRow.nisbet.replace('%', '').replace(',', '.')) || 0,
        hedefDegeri: parseFloat(newRow.artis.replace(',', '.')) || 0,
        tarih: newRow.tarih,
        userUid: user.uid
      });

      // Son olarak gunluk artis olustur
      await createGunlukArtis({
        userId: user.uid,
        personelId: personel.id!,
        artis: parseFloat(newRow.artis.replace(',', '.')) || 0,
        tarih: newRow.tarih,
        userUid: user.uid
      });

      setOpen(false);
      setNewRow({
        personelNo: '',
        ad: '',
        soyad: '',
        departman: '',
        nisbet: '',
        artis: '',
        tarih: new Date().toISOString().split('T')[0]
      });

      // Sayfayi yenile
      window.location.reload();
    } catch (error) {
      console.error('Tek veri eklenirken hata olustu:', error);
      setError('Veri eklenirken bir hata oluştu. Lütfen tüm alanları kontrol edip tekrar deneyin.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!user) {
      setError('Kullanıcı girişi yapılmamış. Lütfen tekrar giriş yapın.');
      setSnackbarOpen(true);
      return;
    }

    if (!bulkData.trim()) {
      setError('Lütfen yüklenecek verileri girin.');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSnackbarOpen(false);

      // Verileri satırlara böl
      const lines = bulkData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // Her satır için veri ekle
      for (const line of lines) {
        const values = line.split('\t');
        if (values.length < 4) continue; // Eksik veri içeren satırları atla

        const [personelNo, faaliyetTip, adSoyad, tip, toplam, hedefDegeri, hedefNisbeti] = values;
        const [ad, soyad] = adSoyad.split(' ', 2);

        if (!personelNo || !ad || !soyad) continue; // Boş alanları atla

        const personelData = {
          personelNo: personelNo.toString(),
          ad: ad.toString(),
          soyad: soyad.toString(),
          departman: `${faaliyetTip || ''} - ${tip || ''}`.trim(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          userId: user.uid, // Giriş yapan kullanıcının UID'si
          createdBy: user.uid, // Veriyi ekleyen kullanıcının UID'si
          userUid: user.uid // Users tablosundaki UID
        };

        console.log('Adding personel with data:', personelData);
        const personel = await createPersonel(personelData);

        // Hedef nisbet verisi ekle
        if (hedefDegeri && hedefNisbeti) {
          await createHedefNisbet({
            userId: user.uid,
            personelId: personel.id!,
            nisbet: parseFloat(hedefNisbeti.replace('%', '').replace(',', '.')) || 0,
            hedefDegeri: parseFloat(hedefDegeri.replace(',', '.')) || 0,
            tarih: bulkUploadDate,
            userUid: user.uid // Users tablosundaki UID
          });
        }

        // Günlük artış verisi ekle
        if (toplam) {
          await createGunlukArtis({
            userId: user.uid,
            personelId: personel.id!,
            artis: parseFloat(toplam.replace(',', '.')) || 0,
            tarih: bulkUploadDate,
            userUid: user.uid // Users tablosundaki UID
          });
        }
      }

      setSnackbarMessage('Veriler başarıyla eklendi');
      setSnackbarOpen(true);
      setBulkOpen(false);
      setBulkData('');
      window.location.reload(); // Sayfayı yenile
    } catch (error) {
      console.error('Toplu veri ekleme hatası:', error);
      setError(error instanceof Error ? error.message : 'Veriler eklenirken bir hata oluştu');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxClick = (id: string) => {
    setSelectedRows(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(rowId => rowId !== id) : [...prevSelected, id]
    );
  };

  const handleSelectAllClick = () => {
    if (selectedRows.length === rows.length) {
      setSelectedRows([]);
    } else {
      // ID sütununu kullanarak tüm satırları seç
      setSelectedRows(rows.map(row => row[0]).filter(id => id !== ''));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    if (window.confirm(`${selectedRows.length} adet kaydı silmek istediğinize emin misiniz?`)) {
      setLoading(true);
      setError(null);
      const failedDeletes: { id: string, error: any }[] = [];

      for (const id of selectedRows) {
        try {
          // Personel kaydını siliyoruz. İlgili hedef nisbet ve günlük artış kayıtlarının da silinmesi gerekirse,
          // bu ID'lere göre ilgili koleksiyonlarda arama yapılıp silinmelidir (Firebase cascade delete desteklemez).
          await deletePersonel(id);
          // İlgili nisbet ve artış kayıtlarını da silmek için ek fonksiyonlar çağrılabilir.
          // Örneğin: await deleteHedefNisbetByPersonelId(id); await deleteGunlukArtisByPersonelId(id);

        } catch (deleteError) {
          console.error(`Kayit silinirken hata olustu: ${id}`, deleteError);
          failedDeletes.push({ id, error: deleteError });
        }
      }

      setLoading(false);
      setSelectedRows([]); // Seçimi temizle

      if (failedDeletes.length > 0) {
        setError(`${failedDeletes.length} adet kayit silinemedi. Konsolu kontrol edin.`);
        setSnackbarOpen(true);
      } else {
        alert('Secilen kayitlar basariyla silindi.');
      }

      // Silme işleminden sonra sayfayı yenile
      window.location.reload();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: 20, sm: 24, md: 32 }, mb: { xs: 2, sm: 3 } }}>
          Veri Tablosu
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            {loading ? 'Ekleniyor...' : 'Yeni Tek Veri Ekle'}
          </Button>
           <Button 
            variant="outlined" 
            color="secondary" 
            onClick={() => setBulkOpen(true)}
            disabled={loading}
          >
            Toplu Veri Yükle
          </Button>
           <Button 
            variant="contained" 
            color="error" 
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0 || loading}
          >
            Seçilenleri Sil ({selectedRows.length})
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                 <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                      checked={rows.length > 0 && selectedRows.length === rows.length}
                      onChange={handleSelectAllClick}
                      disabled={loading || rows.length === 0}
                    />
                  </TableCell>
                {TABLE_HEADERS.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEADERS.length + 1} align="center">
                    {loading ? 'Yükleniyor...' : 'Henüz veri bulunmuyor'}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => {
                  const rowId = row[0];
                  const isItemSelected = selectedRows.includes(rowId);

                  return (
                    <TableRow key={index} selected={isItemSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={() => handleCheckboxClick(rowId)}
                          disabled={loading}
                        />
                      </TableCell>
                      <TableCell>{row[1] || ''}</TableCell>
                      <TableCell>{row[2] || ''}</TableCell>
                      <TableCell>{row[3] || ''}</TableCell>
                      <TableCell>{row[4] || ''}</TableCell>
                      <TableCell>{row[5] || ''}</TableCell>
                      <TableCell>{row[6] || ''}</TableCell>
                      <TableCell>{row[7] || ''}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Tek veri ekleme Dialogu */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle>Yeni Veri Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
             <TextField
              label="Personel No"
              value={newRow.personelNo}
              onChange={(e) => setNewRow({ ...newRow, personelNo: e.target.value })}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Ad"
              value={newRow.ad}
              onChange={(e) => setNewRow({ ...newRow, ad: e.target.value })}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Soyad"
              value={newRow.soyad}
              onChange={(e) => setNewRow({ ...newRow, soyad: e.target.value })}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Departman"
              value={newRow.departman}
              onChange={(e) => setNewRow({ ...newRow, departman: e.target.value })}
              fullWidth
              disabled={loading}
            />
             {/* Tekli eklemede Hedef ve Günlük Artış alanlarının etiketlerini güncelleyelim */}
             <TextField
              label="Hedef"
              type="number"
              value={newRow.nisbet}
              onChange={(e) => setNewRow({ ...newRow, nisbet: e.target.value })}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Toplam"
              type="number"
              value={newRow.artis}
              onChange={(e) => setNewRow({ ...newRow, artis: e.target.value })}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Tarih"
              type="date"
              value={newRow.tarih}
              onChange={(e) => setNewRow({ ...newRow, tarih: e.target.value })}
              fullWidth
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>İptal</Button>
          <Button onClick={handleAddRow} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toplu veri ekleme Dialogu */}
      <Dialog open={bulkOpen} onClose={() => !loading && setBulkOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Toplu Veri Yükle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
             <TextField
                label="Yükleme Tarihi"
                type="date"
                value={bulkUploadDate}
                onChange={(e) => setBulkUploadDate(e.target.value)}
                fullWidth
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />
            <Typography variant="body2" sx={{ mb: 2 }}>
              Lutfen verileri sekme ('\t') ile ayrilmis sutunlar ve satir sonu ('\n') ile ayrilmis satirlar seklinde asagidaki formatta yapistirin:
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 2, bgcolor: 'grey.200', p: 1, borderRadius: 1 }}>
              {TABLE_HEADERS.join('\t')}
            </Typography>
            <TextField
              autoFocus
              multiline
              fullWidth
              minRows={10}
              variant="outlined"
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder={TABLE_HEADERS.join('\t') + '\n' + TABLE_HEADERS.map((h, i) => i === 0 ? 'örnek 123' : i === 6 ? 'örnek % 1.0' : `örnek ${h}`).join('\t')}
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkOpen(false)} disabled={loading}>İptal</Button>
          <Button onClick={handleBulkAdd} variant="contained" color="primary" disabled={loading}>
            {loading ? 'Yukleniyor...' : 'Yukle'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DataTablePage;
