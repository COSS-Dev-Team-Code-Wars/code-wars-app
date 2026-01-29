/* eslint-disable */
import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { postFetch } from 'utils/apiRequest';
import { baseURL } from 'utils/constants';
import { SuccessWindow, ErrorWindow } from 'components/';

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
    <Stack spacing={4} sx={{ margin: '3rem' }}>
      <Typography variant="h4">Create Team</Typography>

      <Box sx={{ width: { xs: '100%', sm: '70%', md: '60%' } }}>
        <Stack spacing={2}>
          <TextField fullWidth label="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField fullWidth label="Members (comma separated)" value={members} onChange={(e) => setMembers(e.target.value)} />
          <Box>
            <Button variant="contained" color="major" onClick={handleCreate} sx={{ width: { xs: '100%', sm: '30%' } }}>Create</Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default CreateTeamPage;
