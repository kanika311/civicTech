"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Info,
  Schedule,
  Close,
} from "@mui/icons-material";
import GovNavbar from "../../component/GovNavbar";

const initialNotifications = [
  {
    id: "1",
    type: "success" as const,
    title: "Budget Approved",
    description: "Q2 budget for Public Works has been approved and allocated.",
    time: "5 minutes ago",
  },
  {
    id: "2",
    type: "info" as const,
    title: "New Proposal Submitted",
    description: "Downtown Revitalization Project proposal requires your review.",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Deadline Approaching",
    description: "Annual compliance report due in 3 days.",
    time: "2 hours ago",
  },
  {
    id: "4",
    type: "success" as const,
    title: "Project Completed",
    description: "South District Park renovation has been completed successfully.",
    time: "1 day ago",
  },
];

const notificationStyles = {
  success: {
    bg: "#e8f5e9",
    iconBg: "#c8e6c9",
    iconColor: "#2e7d32",
    Icon: CheckCircle,
  },
  info: {
    bg: "#e3f2fd",
    iconBg: "#bbdefb",
    iconColor: "#1976d2",
    Icon: Info,
  },
  warning: {
    bg: "#fffde7",
    iconBg: "#fff9c4",
    iconColor: "#ed6c02",
    Icon: Schedule,
  },
};

export default function NotificationPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [notifications, setNotifications] = useState(initialNotifications);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const handleMarkAsRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <GovNavbar />
      <Box sx={{ p: isMobile ? 2 : 4, maxWidth: 720, mx: "auto" }}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap="wrap"
              gap={2}
              mb={2}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: "#e3f2fd", width: 44, height: 44 }}>
                  <NotificationsIcon sx={{ color: "#1976d2", fontSize: 26 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You have {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              </Box>
              {unreadCount > 0 && (
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleMarkAllRead}
                  sx={{
                    color: "#1976d2",
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Mark all as read
                </Link>
              )}
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              {notifications.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                  No notifications
                </Typography>
              ) : (
                notifications.map((n) => {
                  const style = notificationStyles[n.type];
                  const Icon = style.Icon;
                  const isUnread = !readIds.has(n.id);
                  return (
                    <Box
                      key={n.id}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: style.bg,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        position: "relative",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: style.iconBg,
                          width: 40,
                          height: 40,
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: style.iconColor, fontSize: 22 }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {n.title}
                          </Typography>
                          {isUnread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#1976d2",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {n.description}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          flexWrap="wrap"
                        >
                          <Typography variant="caption" color="text.secondary">
                            {n.time}
                          </Typography>
                          {isUnread && (
                            <Link
                              component="button"
                              variant="caption"
                              onClick={() => handleMarkAsRead(n.id)}
                              sx={{
                                color: "#1976d2",
                                fontWeight: 600,
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                              }}
                            >
                              Mark as read
                            </Link>
                          )}
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleDismiss(n.id)}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "text.secondary",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        aria-label="Dismiss notification"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
