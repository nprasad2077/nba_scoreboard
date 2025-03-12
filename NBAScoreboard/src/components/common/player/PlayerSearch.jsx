import React, { useState, useEffect } from "react";
import { Box, TextField, Autocomplete, Typography, CircularProgress } from "@mui/material";

/**
 * Component for searching NBA players
 * 
 * @param {Object} props - Component props
 * @param {string} props.searchQuery - Current search query
 * @param {Array} props.searchResults - Search results
 * @param {Function} props.onSearchChange - Function to handle search query changes
 * @param {Function} props.onPlayerSelect - Function to handle player selection
 * @param {boolean} props.isLoading - Whether search is in progress
 * @param {string} props.error - Error message if search failed
 * @returns {JSX.Element} - Rendered component
 */
const PlayerSearch = ({ 
  searchQuery, 
  searchResults, 
  onSearchChange, 
  onPlayerSelect,
  isLoading = false,
  error = null 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [noOptionsText, setNoOptionsText] = useState('Start typing to search for players');

  // Update no options text based on query length and loading state
  useEffect(() => {
    if (isLoading) {
      setNoOptionsText('Loading...');
    } else if (error) {
      setNoOptionsText(`Error: ${error}`);
    } else if (inputValue.length > 0 && inputValue.length < 2) {
      setNoOptionsText('Type at least 2 characters to search');
    } else if (inputValue.length >= 2 && searchResults.length === 0) {
      setNoOptionsText('No players found');
    } else {
      setNoOptionsText('Start typing to search for players');
    }
  }, [inputValue, isLoading, error, searchResults]);

  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        width: "100%"
      }}
    >
      <Autocomplete
        options={searchResults}
        getOptionLabel={(option) =>
          `${option.display_name} - ${option.team_abbreviation}`
        }
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          onSearchChange(newInputValue);
        }}
        onChange={(event, newValue) => {
          onPlayerSelect(newValue);
        }}
        loading={isLoading}
        noOptionsText={noOptionsText}
        sx={{
          width: "100%",
          maxWidth: 800,
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#262626",
            "&:hover": {
              backgroundColor: "#2d2d2d",
            },
            "& fieldset": {
              borderColor: error ? "red" : "rgba(255, 255, 255, 0.08)",
            },
            "&:hover fieldset": {
              borderColor: error ? "red" : "rgba(255, 255, 255, 0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: error ? "red" : theme => theme.palette.primary.main,
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a player"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiInputLabel-root": {
                color: error ? "red" : "rgba(255, 255, 255, 0.7)",
                "&.Mui-focused": {
                  color: error ? "red" : theme => theme.palette.primary.main,
                },
              },
              "& .MuiInputBase-input": {
                color: "white",
              },
            }}
          />
        )}
      />
      
      {error && (
        <Typography 
          color="error" 
          variant="body2" 
          sx={{ width: "100%", maxWidth: 800, textAlign: "left" }}
        >
          Error: {error}
        </Typography>
      )}
    </Box>
  );
};

export default PlayerSearch;