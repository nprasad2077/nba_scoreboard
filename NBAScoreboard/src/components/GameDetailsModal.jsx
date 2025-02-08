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
    onClose()
    setActiveTab(0)
  }

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
          backgroundColor: "rgb(30, 30, 30)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgb(30, 30, 30)",
          zIndex: 1,
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            padding: isMobile ? "8px" : "12px 24px",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
            minHeight: "auto",
          }}
        >
          Game Details
          <IconButton
            onClick={resetTab}
            sx={{   
              color: "white",
              padding: isMobile ? "6px" : "8px",
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
            minHeight: "40px",
            "& .MuiTabs-indicator": {
              backgroundColor: "white",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minWidth: "120px",
              minHeight: "40px",
              padding: "6px 16px",
              "&.Mui-selected": {
                color: "white",
              },
            },
          }}
        >
          <Tab
            label="Box Score"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 500,
            }}
          />
          <Tab
            label="Play by Play"
            sx={{
              fontSize: isMobile ? "0.875rem" : "1rem",
              fontWeight: 500,
            }}
          />
        </Tabs>
      </Box>

      <DialogContent
        sx={{
          backgroundColor: "rgb(30, 30, 30)",
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
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
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
