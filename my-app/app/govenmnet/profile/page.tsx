"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Email,
  LocationOn,
  Phone,
  CalendarMonth,
  Shield,
  Edit as EditIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import GovNavbar from "../../component/GovNavbar";
import { authApi, type ProfileResponse } from "../../../lib/api";
import { useAppDispatch } from "../../../store/hooks";
import { logout } from "../../../store/authSlice";

function formatMemberSince(createdAt?: string) {
  if (!createdAt) return "—";
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return createdAt;
  }
}

export default function AdminProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authApi
      .getProfile()
      .then((res: { ok: true; data: ProfileResponse } | { ok: false; error: string }) => {
        if (res.ok) setProfile(res.data);
        else setError(res.error || "Failed to load profile");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    if (typeof window !== "undefined") window.localStorage.removeItem("token");
    dispatch(logout());
    router.push("/login");
  };

  const contactItems = [
    { Icon: Email, label: "Government ID", value: profile?.email ?? "—" },
    { Icon: LocationOn, label: "Address", value: profile?.address ?? "—" },
    { Icon: Phone, label: "Phone", value: profile?.phone ?? "—" },
    { Icon: CalendarMonth, label: "Member Since", value: formatMemberSince(profile?.createdAt) },
  ];

  const permissions = [
    { title: "Full Administrative Access", desc: "Complete system control" },
    { title: "Budget Management", desc: "Approve and allocate budgets" },
    { title: "Project Oversight", desc: "Monitor all projects" },
    { title: "User Management", desc: "Create and manage users" },
  ];

  const activitySummary = [
    { value: "42", label: "Projects Reviewed" },
    { value: "18", label: "Budgets Approved" },
    { value: "156", label: "Reports Generated" },
  ];

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
        <GovNavbar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <CircularProgress sx={{ color: "#1976d2" }} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
        <GovNavbar />
        <Box sx={{ p: isMobile ? 2 : 4, maxWidth: 900, mx: "auto" }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <GovNavbar />
      <Box sx={{ p: isMobile ? 2 : 4, maxWidth: 900, mx: "auto" }}>
        {/* Admin User Card */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Box
            sx={{
              height: 100,
              bgcolor: "#1976d2",
            }}
          />
          <CardContent sx={{ pt: 0, px: 3, pb: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "flex-end" },
                gap: 2,
                mt: -6,
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "#e3f2fd",
                  color: "#1976d2",
                  border: "4px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <AccountCircle sx={{ fontSize: 56 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                  {profile?.name ?? "Government User"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {profile?.role === "government" ? "Government Official" : "System Administrator"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  href="/govenmnet/profile/edit"
                  sx={{
                    bgcolor: "#1976d2",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2.5,
                    py: 1.25,
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2.5,
                    py: 1.25,
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    "&:hover": { borderColor: "#b71c1c", bgcolor: "rgba(211,47,47,0.04)" },
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, md: 4 },
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {contactItems.map(({ Icon, label, value }) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon sx={{ color: "#757575", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {label}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Access & Permissions */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Shield sx={{ color: "#1976d2", fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Access & Permissions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your role and system access
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {permissions.map(({ title, desc }) => (
                <Box
                  key={title}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f5f5f5",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {desc}
                    </Typography>
                  </Box>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{
                      bgcolor: "#e8f5e9",
                      color: "#2e7d32",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Activity Summary
            </Typography>
            <Grid container spacing={2}>
              {activitySummary.map(({ value, label }) => (
                <Grid size={{ xs: 12, sm: 4 }} key={label}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f9fafc",
                      textAlign: "center",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#1976d2", mb: 0.5 }}
                    >
                      {value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
