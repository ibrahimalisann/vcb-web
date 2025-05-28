import React from 'react';
import { Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

type TableRowType = string[];

function HedefNisbetPage({ rows }: { rows: TableRowType[] }) {
  // Verileri kişilere ve günlere göre gruplama
  // Personeli tekil olarak belirlemek için sadece personelNo'yu kullanıyoruz.
  const personelMap = new Map<string, { id: string; personelNo: string; ad: string; nisbetler: string[] }>();
  const tarihler: string[] = [];
console.log("hedef nisbet page");

  // Verileri personelNo ve tarihe göre grupla ve günleri belirle
  rows.forEach((row) => {
    const personelId = row[0]; // Firebase ID (şimdilik sadece bilgi amaçlı saklanıyor)
    const personelNo = row[1]; // PersonelNO (gruplama anahtarı)
    const personelAdSoyad = row[3]; // AD SOYAD
    const hedefNisbeti = row[7]; // HEDEF NİSBETİ
    const tarih = row[8]; // Tarih

    // Personel için benzersiz anahtar olarak personelNo'yu kullanalım
    const personelKey = personelNo; // Gruplama anahtarı

    if (!personelMap.has(personelKey)) {
      personelMap.set(personelKey, { id: personelId, personelNo: personelNo, ad: personelAdSoyad, nisbetler: [] });
    }

    if (tarih && !tarihler.includes(tarih)) {
      tarihler.push(tarih);
    }
  });

  tarihler.sort(); // Tarihleri sırala
  const gunSayisi = tarihler.length;

  // Her personelin her gününe ait hedef nisbeti değerlerini doğru sütunlara yerleştir
  rows.forEach(row => {
    const personelNo = row[1]; // PersonelNO (gruplama anahtarı)
    const hedefNisbeti = row[7];
    const tarih = row[8];
    const personelKey = personelNo; // Gruplama anahtarı
    const gunIndex = tarihler.indexOf(tarih);

    if (personelMap.has(personelKey) && gunIndex !== -1) {
      const personelData = personelMap.get(personelKey)!;
      // Nisbetler dizisinin boyutunu gün sayısına eşitleyin ve varsayılan değer atayın
      while (personelData.nisbetler.length < gunSayisi) {
          personelData.nisbetler.push(''); // Olmayan günler için boş değer atayın
      }
      personelData.nisbetler[gunIndex] = hedefNisbeti || '';
    }
  });

  function parsePercent(val: string | undefined) {
    if (!val) return 0;
    return parseFloat(val.replace("%", "").replace(",", ".")) || 0;
  }

  // Son iki günün yüzde farkını hesapla
  const sonIkiGunFarklari = new Map<string, number>();
  personelMap.forEach((personel, key) => {
    if (personel.nisbetler.length >= 2) {
      const sonGun = parsePercent(personel.nisbetler[personel.nisbetler.length - 1]);
      const oncekiGun = parsePercent(personel.nisbetler[personel.nisbetler.length - 2]);
      const fark = sonGun - oncekiGun;
      sonIkiGunFarklari.set(key, fark);
    }
  });

  // Tablo başlıklarını oluştur: AD SOYAD ve günler
  const tableHeaders = [
    'Ad Soyad',
    'PersonelNO', // PersonelNO'yu da gösterelim
    ...tarihler.map((tarih, index) => `${index + 1}. Gün (${tarih})`),
    'Artış (%)'
  ];

  const sortedPersonnel = Array.from(personelMap.values()).sort((a, b) => a.ad.localeCompare(b.ad));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: 20, sm: 24, md: 32 }, mb: { xs: 2, sm: 3 } }}>
          Günlük Hedef Nisbeti
        </Typography>
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header, index) => (
                  <TableCell 
                    key={index}
                    sx={{
                      background: header === 'Artış (%)' ? '#6ba6d7' : 'inherit',
                      color: header === 'Artış (%)' ? 'white' : 'inherit',
                      fontWeight: header === 'Artış (%)' ? 'bold' : 'normal'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPersonnel.map((personel) => {
                const artis = sonIkiGunFarklari.get(personel.personelNo) || 0;
                let bgColor = "#fffde7";
                if (artis > 0) bgColor = "#e8f5e9";
                else if (artis < 0) bgColor = "#ffebee";

                return (
                  <TableRow key={personel.personelNo}> {/* Key olarak personelNo kullanmak daha uygun olabilir */}
                    <TableCell>{personel.ad}</TableCell>
                    <TableCell>{personel.personelNo}</TableCell> {/* PersonelNO sütunu */}
                    {/* Her gün için hedef nisbeti değerlerini göster */}
                    {Array.from({ length: gunSayisi }).map((_, gunIndex) => (
                       // Nisbetler dizisinin boyutunu kontrol ederek güvenli erişim sağlayın
                      <TableCell key={gunIndex}>{personel.nisbetler[gunIndex] || ''}</TableCell>
                    ))}
                    <TableCell sx={{ backgroundColor: bgColor }}>
                      {personel.nisbetler.length >= 2 ? `%${artis.toFixed(1)}` : ''}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default HedefNisbetPage;
