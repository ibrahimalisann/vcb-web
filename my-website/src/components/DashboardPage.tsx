import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Grid, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';

type TableRowType = string[];

type ChartDataType = {
  name: string;
  artis: number;
};

function DashboardPage({ rows }: { rows: TableRowType[] }) {
    const [openDetay, setOpenDetay] = useState(false);
    
    // Verileri personelNo ve tarihe göre grupla ve günleri belirle
    const personelMap = new Map<string, { id: string; personelNo: string; ad: string; nisbetler: string[] }>();
    const tarihler: string[] = [];

    rows.forEach((row) => {
      const personelId = row[0];
      const personelNo = row[1];
      const personelAdSoyad = row[3];
      const hedefNisbeti = row[7];
      const tarih = row[8];

      const personelKey = personelNo;

      if (!personelMap.has(personelKey)) {
        personelMap.set(personelKey, { id: personelId, personelNo: personelNo, ad: personelAdSoyad, nisbetler: [] });
      }

      if (tarih && !tarihler.includes(tarih)) {
        tarihler.push(tarih);
      }
    });

    tarihler.sort();
    const gunSayisi = tarihler.length;
    const kisiSayisi = personelMap.size;

    // Her personelin her gününe ait hedef nisbeti değerlerini doğru sütunlara yerleştir
    rows.forEach(row => {
      const personelNo = row[1];
      const hedefNisbeti = row[7];
      const tarih = row[8];
      const personelKey = personelNo;
      const gunIndex = tarihler.indexOf(tarih);

      if (personelMap.has(personelKey) && gunIndex !== -1) {
        const personelData = personelMap.get(personelKey)!;
        while (personelData.nisbetler.length < gunSayisi) {
            personelData.nisbetler.push('');
        }
        personelData.nisbetler[gunIndex] = hedefNisbeti || '';
      }
    });

    function parsePercent(val: string | undefined) {
      if (!val) return 0;
      return parseFloat(val.replace("%", "").replace(",", ".")) || 0;
    }

    // Son günün hedef nisbeti ortalaması
    const sonGunNisbetleri = Array.from(personelMap.values()).map(personel => 
      parsePercent(personel.nisbetler[personel.nisbetler.length - 1])
    );
    const ortalama = sonGunNisbetleri.length > 0
      ? sonGunNisbetleri.reduce((a, b) => a + b, 0) / sonGunNisbetleri.length
      : 0;

    // Günlük artış hesaplamaları
    const artisliListe = Array.from(personelMap.values()).map(personel => {
      const sonGun = personel.nisbetler.length > 0 ? personel.nisbetler[personel.nisbetler.length - 1] : "";
      const oncekiGun = personel.nisbetler.length > 1 ? personel.nisbetler[personel.nisbetler.length - 2] : "";
      const artis = parsePercent(sonGun) - parsePercent(oncekiGun);
      return {
        id: personel.id,
        personelNo: personel.personelNo,
        ad: personel.ad,
        sonGun,
        oncekiGun,
        artis
      };
    });

    // Günün lideri
    artisliListe.sort((a, b) => b.artis - a.artis);
    const gununLideri = artisliListe.length > 0 ? artisliListe[0] : null;

    // Günlük artış ortalaması ve dağılımı
    const gunlukArtisOrtalama = artisliListe.length > 0
      ? artisliListe.reduce((a, b) => a + b.artis, 0) / artisliListe.length
      : 0;

    const ustunde = artisliListe.filter(a => a.artis > gunlukArtisOrtalama).length;
    const altinda = artisliListe.filter(a => a.artis < gunlukArtisOrtalama).length;
    const esit = artisliListe.length - ustunde - altinda;

    const pieData = [
      { name: 'Üstünde', value: ustunde },
      { name: 'Altında', value: altinda },
      { name: 'Eşit', value: esit },
    ];
    const pieColors = ['#43a047', '#e53935', '#fbc02d'];

    // Kalan gün hesabı
    const hedefTarih = new Date('2025-06-07');
    const bugun = new Date();
    const kalanGun = Math.ceil((hedefTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    // Genel nisbet hesaplamaları
    const genelNisbetler = Array.from(personelMap.values()).map(personel => ({
      id: personel.id,
      ad: personel.ad,
      nisbet: parsePercent(personel.nisbetler[personel.nisbetler.length - 1])
    }));

    const genelOrtalama = genelNisbetler.length > 0
      ? genelNisbetler.reduce((a, b) => a + b.nisbet, 0) / genelNisbetler.length
      : 0;

    const genelUstunde = genelNisbetler.filter(p => p.nisbet > genelOrtalama);
    const genelAltinda = genelNisbetler.filter(p => p.nisbet < genelOrtalama);

    const chartData: ChartDataType[] = [
      { name: 'Genel', artis: gunlukArtisOrtalama },
      { name: 'Hedefe Olan', artis: ortalama },
      { name: 'Son Kaç Gün Kaldı', artis: kalanGun }
    ];

    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: 20, sm: 24, md: 32 }, mb: { xs: 2, sm: 3 } }}>
            Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center' }}>
          <Box sx={{ minWidth: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Toplam Personel</Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>{kisiSayisi}</Typography>
          </Box>
          <Box sx={{ minWidth: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Toplam Gün</Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>{gunSayisi}</Typography>
          </Box>
          <Box sx={{ minWidth: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Son Gün HEDEF NİSBETİ Ortalaması</Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>%{ortalama.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ minWidth: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Günlük Artış Ortalaması</Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>%{gunlukArtisOrtalama.toFixed(1)}</Typography>
          </Box>
          <Box sx={{ minWidth: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Son Kaç Gün Kaldı</Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>{kalanGun}</Typography>
          </Box>
          <Box sx={{ minWidth: 320, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Genel HEDEF NİSBETİ Ortalaması
            </Typography>
            <Typography variant="h5" color="primary" fontWeight={700}>%{genelOrtalama.toFixed(1)}</Typography>
            <Typography variant="body2" color="success.main">Üstünde: {genelUstunde.length} kişi</Typography>
            <Typography variant="body2" color="error.main">Altında: {genelAltinda.length} kişi</Typography>
            <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => setOpenDetay(true)}>Detay</Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center', alignItems: 'center' }}>
          <Box sx={{ minWidth: 320, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Son Günün Lideri</Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>{gununLideri?.ad || '-'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Artış: {gununLideri ? `%${gununLideri.artis.toFixed(1)}` : '%0.0'}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 320, height: 220, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Günlük Artış Dağılımı</Typography>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Üstünde', value: ustunde, color: '#4caf50' },
                    { name: 'Altında', value: altinda, color: '#f44336' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Üstünde', value: ustunde, color: '#4caf50' },
                    { name: 'Altında', value: altinda, color: '#f44336' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{ minWidth: 320, p: 3, bgcolor: 'white', borderRadius: 2, textAlign: 'center', boxShadow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Ortalama Karşılaştırması</Typography>
            <Typography variant="body1" color="success.main" fontWeight={700}>Üstünde: {ustunde} kişi</Typography>
            <Typography variant="body1" color="error.main" fontWeight={700}>Altında: {altinda} kişi</Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center', mt: 4, color: '#888' }}>
          <Typography variant="h6" fontWeight={500}>
            Başarı, küçük adımların toplamıdır. Her gün bir adım daha ileri!
          </Typography>
        </Box>
        <Dialog
          open={openDetay}
          onClose={() => setOpenDetay(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              width: { xs: '95%', sm: '80%', md: '60%' },
              maxHeight: { xs: '90vh', sm: '80vh' }
            }
          }}
        >
          <DialogTitle sx={{ fontSize: { xs: 18, sm: 24 } }}>Detaylı Bilgi</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 20 }, mb: 2, color: 'success.main' }}>
                      Ortalamanın Üstündekiler
                    </Typography>
                    <List>
                      {genelUstunde.map((p, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ArrowUpwardIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={p.ad} secondary={`%${p.nisbet.toFixed(1)}`} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: { xs: 16, sm: 20 }, mb: 2, color: 'error.main' }}>
                      Ortalamanın Altındakiler
                    </Typography>
                    <List>
                      {genelAltinda.map((p, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ArrowDownwardIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={p.ad} secondary={`%${p.nisbet.toFixed(1)}`} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetay(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

export default DashboardPage;
