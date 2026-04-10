"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  IconButton,
  Badge,
  Avatar,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Business as BuildingIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";

export default function GovNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = 3; // Could come from context/API later

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#fff",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          px: { xs: 2, md: 3 },
          gap: 3,
        }}
      >
        {/* Left: Logo + Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BuildingIcon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                lineHeight: 1.2,
                fontSize: "1.125rem",
              }}
            >
              Civic Dashboard
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#757575",
                fontSize: "0.75rem",
                display: "block",
              }}
            >
              Governance &amp; Analytics
            </Typography>
          </Box>
        </Box>

        {/* Center: Search */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 480,
            mx: "auto",
            display: { xs: "none", sm: "block" },
          }}
        >
          <Box
            sx={{
              position: "relative",
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.common.black, 0.04),
              border: "1px solid",
              borderColor: "#e0e0e0",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.common.black, 0.06),
                borderColor: "#bdbdbd",
              },
              "&:focus-within": {
                borderColor: "#1976d2",
                bgcolor: "#fff",
              },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <SearchIcon sx={{ color: "#9e9e9e", fontSize: 22 }} />
              <InputBase
                placeholder="Search departments, projects, or reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  fontSize: "0.875rem",
                  "& .MuiInputBase-input": {
                    py: 0,
                    "&::placeholder": {
                      color: "#9e9e9e",
                      opacity: 1,
                    },
                  },
                }}
                inputProps={{ "aria-label": "Search" }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right: Notifications + User */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexShrink: 0,
          }}
        >
          <IconButton
            component={Link}
            href="/govenmnet/notification"
            size="large"
            aria-label="notifications"
            sx={{
              color: "#616161",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Link
            href="/govenmnet/profile"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                pl: 1,
                borderLeft: "1px solid",
                borderColor: "#eee",
                cursor: "pointer",
                "&:hover": { opacity: 0.85 },
              }}
            >
              <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3 }}
                >
                  Admin User
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#757575", fontSize: "0.7rem" }}
                >
                  Department of State
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#e3f2fd",
                  color: "#1976d2",
                }}
              >
                <AccountCircle sx={{ fontSize: 28 }} />
              </Avatar>
              <ArrowDownIcon sx={{ color: "#757575", fontSize: 20 }} />
            </Box>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
