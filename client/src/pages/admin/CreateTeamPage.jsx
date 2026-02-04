/* eslint-disable */
import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography, Paper } from '@mui/material';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { SuccessWindow, ErrorWindow } from 'components/';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const CreateTeamPage = () => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState('');

  const handleCreate = async () => {
    if (!teamName.trim() || !password.trim()) {
      ErrorWindow.fire({ title: 'Missing fields', text: 'Team name and password are required.' });
      return;
    }

    try {
      const res = await postFetch(`${baseURL}/signup`, {
        username: teamName.trim(),
        password: password,
        usertype: 'team',
        members: members.trim(),
      });

      if (res.success) {
        SuccessWindow.fire({ text: 'Team successfully created.' });
        setTeamName('');
        setPassword('');
        setMembers('');
      } else {
        ErrorWindow.fire({ title: 'Create failed', text: res.results || 'Unknown error' });
      }
    } catch (err) {
      ErrorWindow.fire({ title: 'Request failed', text: err.message || String(err) });
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 500,
        mx: 'auto',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          padding: '3rem 4rem',
          borderRadius: 5,
          background: '#fff',
        }}
      >
        <Stack spacing={3.5} alignItems="center">
          {/* Icon and Title */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              }}
            >
              <GroupAddIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 0.5,
              }}
            >
              Create Team
            </Typography>
          </Box>

          {/* Form Fields */}
          <Stack spacing={2.5} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Members (comma separated)"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              variant="outlined"
              multiline
              rows={2}
              placeholder="name1, name2, name3"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8f9fa',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: '#fff',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />

            <Button
              variant="contained"
              color="major"
              onClick={handleCreate}
              fullWidth
              sx={{
                marginTop: 2,
                padding: '0.875rem 0',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
            >
              Create Team
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CreateTeamPage;