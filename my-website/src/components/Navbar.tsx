import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton } from '@mui/material';
import { Home as HomeIcon, BarChart as BarChartIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  // Kullanıcı giriş yapmamışsa navbar'ı gösterme
  if (!user) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 1, sm: 2 }, 
        px: { xs: 1, sm: 2 } 
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontSize: { xs: 18, sm: 24 }, 
            mb: { xs: 1, sm: 0 } 
          }}
        >
          Mavera Dijital
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          width: { xs: '100%', sm: 'auto' }, 
          gap: 1 
        }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/" 
            startIcon={<HomeIcon />} 
            fullWidth={true} 
            sx={{ minWidth: 120 }}
          >
            Ana Sayfa
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/dashboard" 
            startIcon={<BarChartIcon />} 
            fullWidth={true} 
            sx={{ minWidth: 120 }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/hedef-nisbet" 
            startIcon={<BarChartIcon />} 
            fullWidth={true} 
            sx={{ minWidth: 120 }}
          >
            Günlük Hedef Nisbeti
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/gunluk-artis" 
            startIcon={<BarChartIcon />} 
            fullWidth={true} 
            sx={{ minWidth: 120 }}
          >
            Günlük Artış Yüzdesi
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            fullWidth={true}
            sx={{ 
              minWidth: 120,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            Çıkış Yap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 