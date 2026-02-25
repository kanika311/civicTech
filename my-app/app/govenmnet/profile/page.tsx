"use client";

import React from "react";
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
} from "@mui/material";
import {
  Email,
  LocationOn,
  Phone,
  CalendarMonth,
  Shield,
  Edit as EditIcon,
  AccountCircle,
} from "@mui/icons-material";
import GovNavbar from "../../component/GovNavbar";

export default function AdminProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const contactItems = [
    { Icon: Email, label: "Email", value: "admin@citygovernment.gov" },
    { Icon: LocationOn, label: "Department", value: "Department of State" },
    { Icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { Icon: CalendarMonth, label: "Member Since", value: "January 2024" },
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
                  Admin User
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  System Administrator
                </Typography>
              </Box>
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
