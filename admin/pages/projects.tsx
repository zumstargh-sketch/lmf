import React, { FormEvent, useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import Link from 'next/link';

type Project = { id: string; title: string; category: string; region: string; status: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ title: '', category: '', region: '', description: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = () => fetch(`${apiUrl}/projects`).then((response) => response.json()).then(setProjects).catch(() => setMessage('Could not load projects. Start the backend and try again.')).finally(() => setLoading(false));
  useEffect(() => { loadProjects(); }, []);

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    const response = await fetch(`${apiUrl}/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!response.ok) { setMessage('Project could not be created. Check the required fields.'); return; }
    setForm({ title: '', category: '', region: '', description: '' });
    setMessage('Project created successfully.');
    loadProjects();
  };

  return <Box sx={{ minHeight: '100vh', py: 6, background: 'linear-gradient(120deg, #F4F1EA 0%, #EAF0EC 100%)' }}><Container maxWidth="md"><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}><Box><Typography variant="overline" color="primary.main">Foundation workspace</Typography><Typography variant="h3">Projects</Typography></Box><Button component={Link} href="/" variant="outlined">Dashboard</Button></Stack>{message && <Alert sx={{ mb: 3 }} severity={message.includes('successfully') ? 'success' : 'error'}>{message}</Alert>}<Paper component="form" onSubmit={createProject} sx={{ p: 3, mb: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Add a project</Typography><Stack spacing={2}><TextField required label="Project title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><TextField required label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><TextField required label="Region" value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} /><TextField multiline minRows={3} label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><Button type="submit" variant="contained">Create project</Button></Stack></Paper><Paper sx={{ p: 3 }}><Typography variant="h6" sx={{ mb: 2 }}>Current projects</Typography>{loading ? <Typography color="text.secondary">Loading projects...</Typography> : projects.length === 0 ? <Typography color="text.secondary">No projects yet.</Typography> : <Stack spacing={1}>{projects.map((project) => <Box key={project.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}><Typography fontWeight={700}>{project.title}</Typography><Typography variant="body2" color="text.secondary">{project.category} · {project.region} · {project.status}</Typography></Box>)}</Stack>}</Paper></Container></Box>;
}
