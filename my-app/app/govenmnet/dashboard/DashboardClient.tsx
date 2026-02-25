"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  Modal,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  People,
  Description,
  TrendingUp,
  EmojiEvents,
  Layers,
  LocationOn,
  Refresh,
  ReportProblem,
  Close,
  Email,
  CalendarMonth,
} from "@mui/icons-material";
import { BarChart, LineChart } from "@mui/x-charts";
import GovNavbar from "../../component/GovNavbar";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const allocatedData = [4200, 3800, 5000, 4700, 5400, 6000];
const spentData = [3800, 3300, 4500, 4200, 5000, 5800];

const departments = [
  { name: "Public Works", score: 9850, growth: "+12%" },
  { name: "Education Dept.", score: 9420, growth: "+8%" },
  { name: "Health Services", score: 9180, growth: "+15%" },
  { name: "Parks & Recreation", score: 8950, growth: "+5%" },
];

const citizenEngagementData = [100000, 102000, 101500, 103500, 104500, 105500];

const departmentBudget = [
  { dept: "Education", value: 3400 },
  { dept: "Healthcare", value: 3200 },
  { dept: "Infrastructure", value: 2800 },
  { dept: "Public Safety", value: 2000 },
  { dept: "Environment", value: 900 },
];

const districts = [
  { name: "Downtown", count: 12, status: "Active" as const },
  { name: "North District", count: 8, status: "Active" as const },
  { name: "South District", count: 15, status: "Planning" as const },
  { name: "East Side", count: 6, status: "Active" as const },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ComplaintItem = {
  _id: string;
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  photos?: string[];
  status?: string;
  createdAt?: string;
  user?: { name?: string; email?: string };
};

export default function DashboardClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    if (!token) {
      setComplaintsLoading(false);
      return;
    }
    fetch(`${API_URL}/api/government/complaints`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setComplaints([]))
      .finally(() => setComplaintsLoading(false));
  }, []);

  const totalActiveIssues = complaints.length;

  const sampleComplaints: ComplaintItem[] = [
    {
      _id: "sample-1",
      title: "Pothole on Main Street",
      description: "Large pothole near the intersection causing damage to vehicles. Needs urgent repair.",
      category: "Infrastructure",
      location: "Main Street, Block 5",
      status: "Pending",
      createdAt: new Date().toISOString(),
      user: { name: "Rahul Sharma", email: "rahul@email.com" },
    },
    {
      _id: "sample-2",
      title: "Street light not working",
      description: "The street light has been off for two weeks. Dark at night, safety concern for pedestrians.",
      category: "Utilities",
      location: "Oak Avenue, Near Park",
      status: "In Progress",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      user: { name: "Priya Singh", email: "priya@email.com" },
    },
    {
      _id: "sample-3",
      title: "Garbage not collected",
      description: "Garbage bins have not been emptied for 5 days. Bad smell and unhygienic.",
      category: "Sanitation",
      location: "Elm Street, District 2",
      status: "Resolved",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      user: { name: "Amit Kumar", email: "amit@email.com" },
    },
    {
      _id: "sample-4",
      title: "Broken footpath",
      description: "Footpath tiles are broken and uneven. Elderly and children at risk of tripping.",
      category: "Infrastructure",
      location: "Central Market Road",
      status: "Pending",
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      user: { name: "Sneha Patel", email: "sneha@email.com" },
    },
  ];

  const complaintsToShow = complaints.length > 0 ? complaints : sampleComplaints;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <GovNavbar />
      <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Grid container spacing={3}>
        {[
          {
            title: "Active Citizens",
            value: "127.5K",
            icon: <People sx={{ color: "#1976d2" }} />,
            growth: "+12.5%",
            positive: true,
          },
          {
            title: "Pending Proposals",
            value: "284",
            icon: <Description sx={{ color: "#1976d2" }} />,
            growth: "-5.2%",
            positive: false,
          },
          {
            title: "Budget Allocated",
            value: "$12.8M",
            icon: <TrendingUp sx={{ color: "#1976d2" }} />,
            growth: "+8.3%",
            positive: true,
          },
        ].map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Avatar sx={{ bgcolor: "#e3f2fd", width: 48, height: 48 }}>
                    {item.icon}
                  </Avatar>
                  <Chip
                    label={item.growth}
                    size="small"
                    sx={{
                      bgcolor: item.positive ? "#e8f5e9" : "#ffebee",
                      color: item.positive ? "#2e7d32" : "#c62828",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                  {item.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {/* Active Issues – count only */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Avatar sx={{ bgcolor: "#ffebee", width: 48, height: 48 }}>
                  <ReportProblem sx={{ color: "#c62828" }} />
                </Avatar>
                <Chip
                  label="Citizen complaints"
                  size="small"
                  sx={{
                    bgcolor: "#e3f2fd",
                    color: "#1976d2",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
                Active Issues
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                {totalActiveIssues}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Citizen Complaints – list below; API data or sample */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <ReportProblem sx={{ color: "#1976d2", fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Citizen Complaints
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click a complaint to see full description, location, photos &amp; citizen details
              </Typography>
            </Box>
          </Box>
          {complaintsLoading ? (
            <Typography color="text.secondary">Loading complaints...</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {complaints.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                  Showing sample complaints. Log in as government to see real data from citizens.
                </Typography>
              )}
              {complaintsToShow.slice(0, 20).map((c) => (
                <Box
                  key={c._id}
                  onClick={() => setSelectedComplaint(c)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f5f5f5",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#eeeeee" },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography fontWeight={600}>{c.title || "No title"}</Typography>
                    <Chip
                      size="small"
                      label={c.status || "Pending"}
                      sx={{
                        bgcolor:
                          c.status === "Resolved"
                            ? "#e8f5e9"
                            : c.status === "In Progress"
                              ? "#e3f2fd"
                              : "#fff3e0",
                        color:
                          c.status === "Resolved"
                            ? "#2e7d32"
                            : c.status === "In Progress"
                              ? "#1976d2"
                              : "#ed6c02",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                    {c.description || "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.category && `${c.category} • `}
                    {c.location && `${c.location} • `}
                    {c.user?.name && `By ${c.user.name}`}
                    {c.createdAt && ` • ${new Date(c.createdAt).toLocaleDateString()}`}
                  </Typography>
                </Box>
              ))}
              {complaintsToShow.length > 20 && (
                <Typography variant="caption" color="text.secondary">
                  Showing latest 20 of {complaintsToShow.length}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold">Budget Overview</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monthly budget allocation vs spending
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: "band", data: months }]}
                  yAxis={[{ max: 8000 }]}
                  series={[
                    { data: allocatedData, label: "Allocated", color: "#1976d2" },
                    { data: spentData, label: "Spent", color: "#ed6c02" },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Department Rankings</Typography>
              {departments.map((dept, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                  <Avatar sx={{ bgcolor: "#fff3e0", width: 40, height: 40, flexShrink: 0 }}>
                    <EmojiEvents sx={{ color: "#ed6c02", fontSize: 20 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">{dept.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">{dept.score.toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((dept.score / 10000) * 100, 100)}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "#e3f2fd",
                          "& .MuiLinearProgress-bar": { bgcolor: "#1976d2" },
                        }}
                      />
                      <Typography variant="caption" fontWeight={600} sx={{ color: "#2e7d32", minWidth: 32 }}>
                        {dept.growth}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold">Citizen Engagement</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Active citizens over time
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <LineChart
                  height={300}
                  xAxis={[{ scaleType: "point", data: months }]}
                  yAxis={[{ min: 0, max: 140000 }]}
                  series={[
                    { data: citizenEngagementData, label: "Citizens", color: "#1976d2", area: true },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold">Department Distribution</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Budget allocation by department
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: "band", data: departmentBudget.map((d) => d.dept) }]}
                  yAxis={[{ max: 3600 }]}
                  series={[
                    { data: departmentBudget.map((d) => d.value), label: "Budget", color: "#1976d2" },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="bold">Regional Overview</Typography>
                  <Typography variant="body2" color="text.secondary">Active projects by district</Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<Layers />}
                  sx={{ textTransform: "none", color: "text.secondary", border: "1px solid", borderColor: "divider" }}
                >
                  View Layers
                </Button>
              </Box>
              <Box
                sx={{
                  height: 220,
                  borderRadius: 2,
                  bgcolor: "#e8e8e8",
                  backgroundImage: "url(https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  mb: 2,
                }}
              />
              <Box display="flex" gap={2} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#1976d2" }} />
                  <Typography variant="caption">Active</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2e7d32" }} />
                  <Typography variant="caption">Planning</Typography>
                </Box>
              </Box>
              <Grid container spacing={1}>
                {districts.map((d, i) => (
                  <Grid size={{ xs: 12 }} key={i}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1,
                        borderBottom: i < districts.length - 1 ? "1px solid" : "none",
                        borderColor: "divider",
                      }}
                    >
                      <LocationOn sx={{ color: "#757575", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>{d.name}</Typography>
                      <Typography variant="body2" fontWeight={600}>{d.count}</Typography>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: d.status === "Active" ? "#1976d2" : "#2e7d32",
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  size="small"
                  startIcon={<Refresh sx={{ fontSize: 18 }} />}
                  disabled
                  sx={{ textTransform: "none", color: "text.secondary", bgcolor: "#e0e0e0" }}
                >
                  Refreshing...
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detail modal for a complaint */}
      <Modal
        open={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Card
          sx={{
            maxWidth: 560,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Complaint details
              </Typography>
              <IconButton size="small" onClick={() => setSelectedComplaint(null)}>
                <Close />
              </IconButton>
            </Box>
            {selectedComplaint && (
              <>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedComplaint.title || "No title"}
                </Typography>
                <Chip
                  size="small"
                  label={selectedComplaint.status || "Pending"}
                  sx={{ mt: 1 }}
                />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {selectedComplaint.description || "No description."}
                </Typography>
                <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                  {selectedComplaint.category && (
                    <Typography variant="body2">
                      <strong>Category:</strong> {selectedComplaint.category}
                    </Typography>
                  )}
                  {selectedComplaint.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Location:</strong> {selectedComplaint.location}
                      </Typography>
                    </Box>
                  )}
                  {selectedComplaint.user && (
                    <>
                      <Typography variant="body2">
                        <strong>Submitted by:</strong> {selectedComplaint.user.name || "—"}
                      </Typography>
                      {selectedComplaint.user.email && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{selectedComplaint.user.email}</Typography>
                        </Box>
                      )}
                    </>
                  )}
                  {selectedComplaint.createdAt && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarMonth fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(selectedComplaint.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {selectedComplaint.photos && selectedComplaint.photos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Photos
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedComplaint.photos.map((url, i) => (
                        <Box
                          key={i}
                          component="img"
                          src={url}
                          alt=""
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Modal>
      </Box>
    </Box>
  );
}
