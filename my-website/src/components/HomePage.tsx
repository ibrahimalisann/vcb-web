import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hoş Geldiniz
        </Typography>
        <Typography variant="body1" paragraph>
          Veri yönetimi sistemine hoş geldiniz. Aşağıdaki menülerden istediğiniz işlemi seçebilirsiniz.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard'a Git
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/data-table')}
          >
            Veri Ekleme Sayfasına Git
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage; 