import React from 'react';
import JournalEntriesComponent from './components/Journalentries';
import JournalHeader from './components/Journalheader';
import { Toaster } from 'sonner';

const Journal: React.FC = () => {
  return (
    <div>
      <JournalHeader />
      <Toaster position="top-right" richColors />
      <JournalEntriesComponent />
    </div>
  );
};

export default Journal;