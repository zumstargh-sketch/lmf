import React, { useEffect, useState } from 'react';
import {
  Alert, AppBar, Box, Button, Container, Divider, Paper, Stack, TextField, Toolbar, Typography
} from '@mui/material';
import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type Entry = { id: string; title: string; content: string };

export default function AIAnswers() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [form, setForm] = useState<{ id: string | null; title: string; content: string }>({ id: null, title: '', content: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('lf_admin_token') : null;
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (token) loadEntries(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadEntries = async (t: string) => {
    try {
      const res = await fetch(`${apiUrl}/ai/knowledge`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.status === 401 || res.status === 403) { signOut(); setError('Your session expired. Please sign in again.'); return; }
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not reach the API.');
    }
  };

  const signIn = async () => {
    setError('');
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) {
        setError(data.message || 'Sign in failed.');
        return;
      }
      window.localStorage.setItem('lf_admin_token', data.access_token);
      setToken(data.access_token);
      setPassword('');
    } catch {
      setError('Could not reach the API.');
    }
  };

  const signOut = () => {
    window.localStorage.removeItem('lf_admin_token');
    setToken(null);
    setEntries([]);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('A question and an answer are both required.');
      return;
    }
    setError('');
    try {
      const res = await fetch(`${apiUrl}/ai/knowledge${form.id ? `/${form.id}` : ''}`, {
        method: form.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, content: form.content })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Save failed.');
        return;
      }
      setMessage(form.id ? 'Answer updated. The assistant uses it immediately.' : 'Answer added. The assistant uses it immediately.');
      setForm({ id: null, title: '', content: '' });
      loadEntries(token);
    } catch {
      setError('Could not reach the API.');
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/ai/knowledge/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError('Delete failed.'); return; }
      setMessage('Answer deleted.');
      loadEntries(token);
    } catch {
      setError('Could not reach the API.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #F4F1EA 0%, #EAF0EC 100%)' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(28,42,39,.12)' }}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', py: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: '50%', fontSize: 20, fontWeight: 700 }}>L</Box>
            <Box><Typography variant="subtitle1" sx={{ lineHeight: 1 }}>Lordina</Typography><Typography variant="caption" color="text.secondary">FOUNDATION / ADMIN</Typography></Box>
          </Stack>
          <Button sx={{ color: 'text.primary' }} component={Link} href="/">Dashboard</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.5 }}>AI assistant</Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 30, md: 40 }, mt: 0.5 }}>What the assistant knows.</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          Every question and answer here is used instantly by the in-app AI assistant and the WhatsApp auto-responder.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage('')}>{message}</Alert>}

        {!token ? (
          <Paper sx={{ p: 3, maxWidth: 420, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Admin sign in</Typography>
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') signIn(); }} />
              <Button variant="contained" onClick={signIn}>Sign in</Button>
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper component="form" onSubmit={(e) => { e.preventDefault(); save(); }} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>{form.id ? 'Edit answer' : 'Add a question and answer'}</Typography>
              <Stack spacing={2}>
                <TextField label="Question (shown as a suggestion in the app)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <TextField label="Answer the assistant will give" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} multiline minRows={3} />
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained">{form.id ? 'Update answer' : 'Add answer'}</Button>
                  {form.id && <Button variant="text" onClick={() => setForm({ id: null, title: '', content: '' })}>Cancel</Button>}
                </Stack>
              </Stack>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2 }}>Current answers ({entries.length})</Typography>
            <Paper sx={{ p: 0 }}>
              {entries.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 3 }}>No entries yet.</Typography>
              ) : (
                entries.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    {index > 0 && <Divider />}
                    <Box sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography fontWeight={700}>{entry.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{entry.content}</Typography>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                          <Button size="small" variant="outlined" onClick={() => { setForm({ id: entry.id, title: entry.title, content: entry.content }); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</Button>
                          <Button size="small" color="error" onClick={() => remove(entry.id)}>Delete</Button>
                        </Stack>
                      </Stack>
                    </Box>
                  </React.Fragment>
                ))
              )}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}