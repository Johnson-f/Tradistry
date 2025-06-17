import React, { useState } from 'react';
import JournalEntriesComponent from './components/Journalentries';
import { Toaster } from 'sonner';
import JournalHeader from './components/Journalheader';
import { Box } from "@chakra-ui/react";
import JournalFilter from './hook2/Journalfilter';
import JournalOptionsComponent from './components/Journaloptions';

const Journal: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const [viewMode, setViewMode] = useState<"stocks" | "options">("stocks");

  return (
    <div>
      <Box maxW="1200px" mx="auto">
        <JournalHeader 
          filter={filter}
          setFilter={setFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
        {viewMode === "stocks" ? (
          <>
            <JournalFilter
              filter={filter}
              setFilter={setFilter}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
              viewMode={viewMode}
            />
            <Toaster position="top-right" richColors />
            <JournalEntriesComponent
              filter={filter}
              timeFilter={timeFilter}
              setFilter={setFilter}
              setViewMode={setViewMode} // Pass this down
            />
          </>
        ) : (
          <>
            <JournalOptionsComponent onViewEntries={() => setViewMode("stocks")} />
            <Toaster position="top-right" richColors />
          </>
        )}
      </Box>
    </div>
  );
};

export default Journal;