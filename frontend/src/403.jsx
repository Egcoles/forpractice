import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom'; 

const ForbiddenPage = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
      <Box sx={{ p: 4, border: '1px solid #ddd', borderRadius: 2 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          403
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Forbidden
        </Typography>
        <Typography variant="body1" paragraph>
          You do not have permission to access this resource.
        </Typography>
        <Button variant="contained" component={Link} to="/dashboard" sx={{ mt: 3 }}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default ForbiddenPage;