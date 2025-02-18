import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Tabs,
  Tab,
  useMediaQuery,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Import existing components
import BoxScore from "./BoxScore";
import PlayByPlay from "./PlayByPlay";

import SimpleBoxScore from "./SimpleBoxScore";
import EnhancedBoxScore from "./EnhancedBoxScore";

const GameDetailsModal = ({ gameId, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");

  const game_id = gameId?.gameId;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const resetTab = () => {
    onClose();
    setActiveTab(0);
  };

  return (
    <Dialog
      open={open}
      onClose={resetTab}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: isMobile ? "100vh" : "90vh",
          backgroundColor: "#101010",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: isMobile ? 0 : "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "#101010",
          zIndex: 1,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            padding: isMobile ? "12px 16px" : "16px 24px",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            minHeight: "auto",
            fontWeight: 600,
          }}
        >
          Game Details
          <IconButton
            onClick={resetTab}
            sx={{
              color: "white",
              padding: isMobile ? "8px" : "12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Close sx={{ fontSize: isMobile ? "1.25rem" : "1.5rem" }} />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          sx={{
            minHeight: "48px",
            backgroundColor: "#101010",
            "& .MuiTabs-indicator": {
              backgroundColor: "#64b5f6",
              height: "3px",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minWidth: "120px",
              minHeight: "48px",
              padding: "12px 24px",
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#64b5f6",
              },
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            },
          }}
        >
          <Tab
            label="Box Score"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
          <Tab
            label="Play by Play"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
            }}
          />
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          backgroundColor: "#101010",
          padding: 0,
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflow: "auto",
            p: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(255, 255, 255, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.3)",
              },
            },
          }}
        >
          {activeTab === 0 ? (
            <BoxScore game={gameId} open={open} />
          ) : (
            <PlayByPlay gameId={game_id} />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;
