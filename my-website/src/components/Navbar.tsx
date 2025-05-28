import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { Home as HomeIcon, BarChart as BarChartIcon, Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged, User } from 'firebase/auth';

function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
    handleClose();
  };

  // Kullanıcı giriş yapmamışsa navbar'ı gösterme
  if (!user) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ 
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: { xs: 1, sm: 2 } 
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontSize: { xs: 18, sm: 24 }, 
          }}
        >
          Mavera Dijital
        </Typography>
        
        {/* Büyük ekranlar için linkler */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/" 
            startIcon={<HomeIcon />} 
            sx={{ minWidth: 120 }}
          >
            Ana Sayfa
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/dashboard" 
            startIcon={<BarChartIcon />} 
            sx={{ minWidth: 120 }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/hedef-nisbet" 
            startIcon={<BarChartIcon />} 
            sx={{ minWidth: 120 }}
          >
            Günlük Hedef Nisbeti
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/gunluk-artis" 
            startIcon={<BarChartIcon />} 
            sx={{ minWidth: 120 }}
          >
            Günlük Artış Yüzdesi
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
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

        {/* Mobil görünüm için menü ikonu ve menü */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
            aria-controls={open ? 'menu-appbar' : undefined}
            aria-haspopup="true"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleNavigation('/')}>Ana Sayfa</MenuItem>
            <MenuItem onClick={() => handleNavigation('/dashboard')}>Dashboard</MenuItem>
            <MenuItem onClick={() => handleNavigation('/hedef-nisbet')}>Günlük Hedef Nisbeti</MenuItem>
            <MenuItem onClick={() => handleNavigation('/gunluk-artis')}>Günlük Artış Yüzdesi</MenuItem>
            <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 