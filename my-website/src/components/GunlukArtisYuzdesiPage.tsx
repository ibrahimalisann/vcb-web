import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import { ResponsiveContainer } from "recharts";

type TableRowType = string[];

// Günlük Artış Yüzdesi sayfası için başlıklar
const GUNLUK_ARTIS_TABLE_HEADERS = [
  'PersonelNO',
  'Ad Soyad',
  'Son Gün',
  'Bir Önceki Gün',
  'Artış (%)',
];

function GunlukArtisYuzdesiPage({ rows }: { rows: TableRowType[] }) {
  const personelMap = new Map<string, { id: string; personelNo: string; ad: string; nisbetler: string[] }>();
  const tarihler: string[] = [];

  // Verileri personelNo ve tarihe göre grupla ve günleri belirle
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

  // Son iki günün yüzde farkını hesapla
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

  artisliListe.sort((a, b) => b.artis - a.artis);

  // Son günün hedef nisbeti ortalaması
  const sonGunNisbetleri = artisliListe.map(personel => parsePercent(personel.sonGun));
  const sonGunOrtalama = sonGunNisbetleri.length > 0
    ? sonGunNisbetleri.reduce((a, b) => a + b, 0) / sonGunNisbetleri.length
    : 0;

  // Günün lideri
  const gununLideri = artisliListe.length > 0 ? artisliListe[0] : null;

  const gunlukArtisOrtalama =
    artisliListe.length > 0
      ? artisliListe.reduce((a, b) => a + b.artis, 0) / artisliListe.length
      : 0;

  const hedefTarih = new Date("2025-06-07");
  const bugun = new Date();
  const kalanGun = Math.ceil(
    (hedefTarih.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24)
  );

  const infoBoxes = [
    {
      label: "Son Gün Hedef Nisbeti Ortalaması",
      value: `%${sonGunOrtalama.toFixed(1)}`,
      icon: <ArrowUpwardIcon sx={{ color: 'primary.main', fontSize: 24 }} />
    },
    {
      label: "Günün Lideri",
      value: gununLideri ? `${gununLideri.ad} (%${gununLideri.artis.toFixed(1)})` : "-",
      icon: <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 24 }} />
    },
    {
      label: "Genel Günlük Artış Ortalaması",
      value: `%${gunlukArtisOrtalama.toFixed(1)}`,
      icon: <ArrowUpwardIcon sx={{ color: 'info.main', fontSize: 24 }} />
    },
    {
      label: "Son Kaç Gün Kaldı",
      value: kalanGun > 0 ? kalanGun : 0,
      icon: <ArrowDownwardIcon sx={{ color: 'warning.main', fontSize: 24 }} />
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <img
        src="/motivasyon.png"
        alt="Motivasyon"
        style={{
          width: "100%",
          maxWidth: 600,
          display: "block",
          margin: "24px auto 16px auto",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      />
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
       

        {/* Bilgi Kartları */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 6 ,
          
        }}>
          {infoBoxes.map((box, i) => (
            <Card
              key={i}
              sx={{
                height: '100%',
                borderRadius: 2,
                border: "1px solid #90caf9",
                boxShadow: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {box.icon}
                <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
                  {box.label}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {box.value}
              </Typography>
            </Card>
          ))}
        </Box>

        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                {GUNLUK_ARTIS_TABLE_HEADERS.map((header, index) => (
                  <TableCell 
                    key={index}
                    sx={{
                      background: header === 'Artış (%)' ? '#6ba6d7' : 'inherit',
                      color: header === 'Artış (%)' ? 'white' : 'inherit',
                      fontWeight: header === 'Artış (%)' ? 'bold' : 'normal',
                      fontSize: { xs: 12, sm: 14, md: 16 },
                                          }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {artisliListe.map(({ id, personelNo, ad, sonGun, oncekiGun, artis }) => {
                let bgColor = "#fffde7";
                if (artis > gunlukArtisOrtalama) bgColor = "#e8f5e9";
                else if (artis < gunlukArtisOrtalama) bgColor = "#ffebee";

                return (
                  <TableRow key={id} sx={{ backgroundColor: bgColor }}>
                    <TableCell>{personelNo}</TableCell>
                    <TableCell>{ad}</TableCell>
                    <TableCell>{sonGun || ""}</TableCell>
                    <TableCell>{oncekiGun || ""}</TableCell>
                    <TableCell>
                      {sonGun && oncekiGun ? `%${artis.toFixed(1)}` : ""}
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

export default GunlukArtisYuzdesiPage;
