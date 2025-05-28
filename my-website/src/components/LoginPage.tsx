import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { signInWithGoogle } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { createOrUpdateUser } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';

export const COLLECTIONS = {
  PERSONEL: 'personel',
  HEDEF_NISBET: 'hedef_nisbet',
  GUNLUK_ARTIS: 'gunluk_artis',
  USERS: 'users'
} as const;

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await signInWithGoogle();
      
      if (result.user) {
        // Kullanıcı bilgilerini Firestore'a kaydet
        await createOrUpdateUser({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          lastLogin: Timestamp.now()
        });

        console.log('Giriş başarılı:', result.user);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/unauthorized-domain') {
        setError('Bu domain için giriş yetkisi yok. Lütfen yönetici ile iletişime geçin.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Giriş penceresi kapatıldı. Lütfen tekrar deneyin.');
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}
          >
            {/* Logo veya Başlık */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography variant="h4" color="white">
                VCB
              </Typography>
            </Box>

            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                color: 'text.primary'
              }}
            >
              Hoş Geldiniz
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                textAlign: 'center',
                mb: 3
              }}
            >
              Devam etmek için Google hesabınızla giriş yapın
            </Typography>

            <Button
              variant="contained"
              onClick={handleGoogleSignIn}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              sx={{
                width: '100%',
                py: 1.5,
                backgroundColor: 'white',
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Google ile Giriş Yap'}
            </Button>

            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                textAlign: 'center',
                mt: 2
              }}
            >
              Giriş yaparak kullanım koşullarını kabul etmiş olursunuz
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LoginPage; 