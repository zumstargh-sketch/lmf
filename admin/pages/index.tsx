import React, { useEffect, useState } from 'react';
import {
  Alert, AppBar, Box, Button, Chip, Container, Divider, Grid, IconButton, List,
  ListItem, ListItemText, Paper, Snackbar, Stack, Toolbar, Tooltip, Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const fallbackMetrics = [
  { label: 'Active projects', value: '12', detail: '+2 this month', tone: '#176B5B' },
  { label: 'Open assistance cases', value: '28', detail: '7 need review', tone: '#D88A28' },
  { label: 'Scholarship applicants', value: '146', detail: '34 new this week', tone: '#3D6074' },
  { label: 'Funds received', value: '$24,680', detail: '+18.4% this quarter', tone: '#8B4F62' }
];

const activity = [
  ['New scholarship application', 'Amina Yusuf submitted an application', '12 min ago'],
  ['Donation received', 'A $500 donation was recorded for Clean Water', '48 min ago'],
  ['Project update', 'The Kajiado Classroom project reached 80%', '2 hrs ago']
];

type ApiStatus = 'checking' | 'online' | 'offline';
type DashboardSummary = {
  activeProjects: number;
  openAssistanceCases: number;
  scholarshipApplicants: number;
  donationTotal: number;
};

export default function Home() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    Promise.all([fetch(`${apiUrl}/health`, { signal: controller.signal }), fetch(`${apiUrl}/dashboard/summary`, { signal: controller.signal })])
      .then(async ([healthResponse, summaryResponse]) => {
        if (!healthResponse.ok || !summaryResponse.ok) {
          setApiStatus('offline');
          return;
        }
        setApiStatus('online');
        setSummary(await summaryResponse.json());
      })
      .catch(() => setApiStatus('offline'));

    return () => controller.abort();
  }, []);

  const statusLabel = apiStatus === 'checking' ? 'Checking API' : apiStatus === 'online' ? 'API connected' : 'API unavailable';
  const statusColor = apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'error' : 'default';
  const metrics = summary ? [
    { label: 'Active projects', value: summary.activeProjects.toString(), detail: 'Live from API', tone: '#176B5B' },
    { label: 'Open assistance cases', value: summary.openAssistanceCases.toString(), detail: 'Live from API', tone: '#D88A28' },
    { label: 'Scholarship applicants', value: summary.scholarshipApplicants.toString(), detail: 'Live from API', tone: '#3D6074' },
    { label: 'Funds received', value: `${summary.donationTotal.toLocaleString()} GHS`, detail: 'Completed donations', tone: '#8B4F62' }
  ] : fallbackMetrics;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(120deg, #F4F1EA 0%, #EAF0EC 100%)' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(28,42,39,.12)' }}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', py: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1 }}>
            <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: '50%', fontSize: 20, fontWeight: 700 }}>L</Box>
            <Box><Typography variant="subtitle1" sx={{ lineHeight: 1 }}>Lordina</Typography><Typography variant="caption" color="text.secondary">FOUNDATION / ADMIN</Typography></Box>
          </Stack>
          <Chip label={statusLabel} color={statusColor} size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'flex' } }} />
          <Tooltip title="Notifications"><IconButton aria-label="Notifications" sx={{ color: 'text.primary' }} onClick={() => setMessage('You have 7 assistance cases waiting for review.')}>◌</IconButton></Tooltip>
          <Button sx={{ ml: 1, color: 'text.primary' }} onClick={() => setMessage('Profile management will be available after authentication is enabled.')}>Admin profile</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 5 }}>
          <Box><Typography variant="overline" color="primary.main" sx={{ letterSpacing: 1.5 }}>Thursday, September 3, 2026</Typography><Typography variant="h3" sx={{ fontSize: { xs: 34, md: 46 }, mt: .5 }}>Good morning, team.</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>Here is what is moving across the foundation today.</Typography></Box>
          <Button variant="contained" color="secondary" startIcon={<span>+</span>} onClick={() => setMessage('Update composer is ready for the next content workflow.')}>Create update</Button>
        </Stack>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {metrics.map((metric, index) => <Grid item xs={12} sm={6} md={3} key={metric.label}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }}>
              <Paper sx={{ p: 2.5, borderTop: `4px solid ${metric.tone}`, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">{metric.label}</Typography><Typography variant="h4" sx={{ mt: 2 }}>{metric.value}</Typography><Typography variant="caption" sx={{ color: metric.tone, fontWeight: 700 }}>{metric.detail}</Typography>
              </Paper>
            </motion.div>
          </Grid>)}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}><Paper sx={{ p: { xs: 2.5, md: 3 } }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h6">Recent activity</Typography><Typography variant="body2" color="text.secondary">The latest changes from your team</Typography></Box><Button size="small" onClick={() => setMessage('Activity history will open when audit log browsing is enabled.')}>View all</Button></Stack><List disablePadding sx={{ mt: 2 }}>{activity.map(([title, description, time], index) => <React.Fragment key={title}><ListItem disableGutters sx={{ py: 2 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: index === 0 ? 'secondary.main' : 'primary.main', mr: 2 }} /><ListItemText primary={title} secondary={description} /><Typography variant="caption" color="text.secondary">{time}</Typography></ListItem>{index < activity.length - 1 && <Divider />}</React.Fragment>)}</List></Paper></Grid>
          <Grid item xs={12} md={5}><Paper sx={{ p: { xs: 2.5, md: 3 }, height: '100%' }}><Typography variant="h6">Quick actions</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Keep the community informed.</Typography><Stack spacing={1.25}><Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.25 }} onClick={() => router.push('/projects')}>Add a project</Button><Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.25 }} onClick={() => setMessage('Opening 7 assistance cases for review.')} >Review assistance cases <Chip label="7" size="small" sx={{ ml: 'auto' }} /></Button><Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start', py: 1.25 }} onClick={() => setMessage('News editor will open when content permissions are configured.')}>Publish news update</Button></Stack></Paper></Grid>
        </Grid>
      </Container>
      <Snackbar open={message !== null} autoHideDuration={4500} onClose={() => setMessage(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert severity="info" onClose={() => setMessage(null)}>{message}</Alert></Snackbar>
    </Box>
  );
}
