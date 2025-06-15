import React, { useState } from 'react';
import JournalEntriesComponent from './components/Journalentries';
import { Toaster } from 'sonner';
import JournalHeader from './components/Journalheader';
import { Box } from "@chakra-ui/react";
import JournalFilter from './hook2/Journalfilter';

const Journal: React.FC = () => {
  const [filter, setFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // Add this line
  return (
    <div>
      <Box maxW="1200px" mx="auto">
      <JournalHeader 
        filter={filter}
        setFilter={setFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        />
        <JournalFilter />
      <Toaster position="top-right" richColors />
      <JournalEntriesComponent filter={filter} timeFilter={timeFilter} setFilter={setFilter}/>
      </Box>
    </div>
  );
};

export default Journal;