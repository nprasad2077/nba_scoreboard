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

import BoxScore from "./BoxScore";
import PlayByPlay from "./PlayByPlay";


const GameDetailsModal = ({ gameId, open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isXsScreen = useMediaQuery("(max-width:430px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const game_id = gameId?.gameId;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const resetTab = () => {
    onClose();
    setActiveTab(0);
  };

  // Calculate modal size for mobile devices
  const getModalSize = () => {
    if (!isMobile) {
      return {
        maxWidth: "xl",
        fullWidth: true,
        fullScreen: false,
        height: "90vh",
        width: "90%",
        maxHeight: "90vh",
      };
    }
    
    // Mobile in portrait mode
    if (isPortrait) {
      return {
        maxWidth: "sm",
        fullWidth: true,
        fullScreen: false,
        height: "80vh",
        width: "95%",
        maxHeight: "80vh",
        top: "10vh",
      };
    }
    
    // Mobile in landscape mode
    return {
      maxWidth: "xl",
      fullWidth: true,
      fullScreen: false,
      height: "90vh",
      width: "90%",
      maxHeight: "90vh",
    };
  };

  const modalSize = getModalSize();

  return (
    <Dialog
      open={open}
      onClose={resetTab}
      maxWidth={modalSize.maxWidth}
      fullWidth={modalSize.fullWidth}
      fullScreen={modalSize.fullScreen}
      PaperProps={{
        sx: {
          height: modalSize.height,
          width: modalSize.width,
          maxHeight: modalSize.maxHeight,
          backgroundColor: "#101010",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          margin: "0 auto",
          ...(isPortrait && isMobile ? { 
            position: "absolute",
            top: modalSize.top,
          } : {}),
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
            padding: isXsScreen ? "8px 12px" : isMobile ? "12px 16px" : "16px 24px",
            fontSize: isXsScreen ? "1rem" : isMobile ? "1.1rem" : "1.25rem",
            minHeight: "auto",
            fontWeight: 600,
          }}
        >
          Game Details
          <IconButton
            onClick={resetTab}
            sx={{
              color: "white",
              padding: isXsScreen ? "6px" : isMobile ? "8px" : "12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Close sx={{ fontSize: isXsScreen ? "1.1rem" : isMobile ? "1.25rem" : "1.5rem" }} />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          variant="fullWidth"
          sx={{
            minHeight: isXsScreen ? "40px" : "48px",
            backgroundColor: "#101010",
            "& .MuiTabs-indicator": {
              backgroundColor: "#64b5f6",
              height: "3px",
            },
            "& .MuiTab-root": {
              color: "rgba(255, 255, 255, 0.7)",
              minWidth: isXsScreen ? "90px" : "120px",
              minHeight: isXsScreen ? "40px" : "48px",
              padding: isXsScreen ? "8px 12px" : "12px 24px",
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
              fontSize: isXsScreen ? "0.8rem" : isMobile ? "0.875rem" : "1rem",
            }}
          />
          <Tab
            label="Play by Play"
            sx={{
              fontSize: isXsScreen ? "0.8rem" : isMobile ? "0.875rem" : "1rem",
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
            mx: isMobile ? "auto" : 0, // Center content on mobile
            width: "100%",
            maxWidth: "100%",
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