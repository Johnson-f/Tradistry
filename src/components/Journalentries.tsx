import React, { useState, useEffect } from "react";
import { useJournalEntries } from "../hook2/Journalentries";
import { useColorModeValue } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { Tooltip } from "react-tooltip";
import { supabase } from "../supabaseClient";
import {
  useReactTable,
  ColumnDef,
  RowModel,
  Table,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Spinner } from "@chakra-ui/react";
import { toast } from "sonner";
import JournalOptionsComponent from "./Journaloptions";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Table as ChakraTable,
  Button,
  HStack,
} from "@chakra-ui/react";
import useLocalstorage from "../hook2/Localstorage";

// Define types for journal entries
interface JournalEntry {
  id: string;
  symbol: string;
  trade_type: string;
  order_type: string;
  number_shares: number;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  commissions: number;
  entry_date: string;
  exit_date: string;
  p_entry_id?: string; // Added property to match the payload
}

// Define types for journal entry payload
interface JournalEntryPayload {
  symbol: string;
  tradeType: string;
  orderType: string;
  numberShares: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  commissions: number;
  entryDate: string;
  exitDate: string;
}

interface JournalEntriesTableProps {
  journalEntries: JournalEntry[];
  onSelectEntry: (id: string | null) => void;
  onDeleteEntry: (id: string) => void;
  isLoading: boolean;
  onViewOptions: () => void; // Props for viewing options
}

const JournalEntriesTable: React.FC<JournalEntriesTableProps> = ({
  journalEntries,
  onSelectEntry,
  onDeleteEntry,
  isLoading,
  onViewOptions, // Props for viewing options
}) => {
  const textColor = useColorModeValue("black", "white");

  const columns: ColumnDef<JournalEntry>[] = [
    { accessorKey: "symbol", header: "Symbol" },
    { accessorKey: "trade_type", header: "Trade Type" },
    { accessorKey: "order_type", header: "Order Type" },
    { accessorKey: "number_shares", header: "NO of Shares" },
    { accessorKey: "entry_price", header: "Entry Price" },
    { accessorKey: "exit_price", header: "Exit Price" },
    { accessorKey: "stop_loss", header: "Stop Loss" },
    { accessorKey: "take_profit", header: "Take Profit" },
    { accessorKey: "commissions", header: "Trade Fees" },
    { accessorKey: "entry_date", header: "Entry Date" },
    { accessorKey: "exit_date", header: "Exit Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const entryId = row.original.id;
        return (
          <HStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => onSelectEntry(entryId)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => onDeleteEntry(entryId)}
            >
              Delete
            </Button>
          </HStack>
        );
      },
    },
  ];

  // Function to get the core row model for the table
  const table = useReactTable({
    data: journalEntries,
    columns,
    getCoreRowModel: getCoreRowModel(), // Fix: Use the provided utility function
  });

  return (
    <Box
      bg="whiteAlpha.100"
      backdropFilter="blur(5px)"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.300"
      p={6}
      mb={6}
      mt={60}
      w="100%"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box as="h2" fontSize="2xl" fontWeight="bold" color={textColor}>
          Stocks ({journalEntries.length})
          {isLoading && <Spinner size="sm" ml={2} color="whiteAlpha.600" />}
        </Box>
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => onSelectEntry(null)}>
            New Entry
          </Button>
          <Button colorScheme="green" onClick={onViewOptions}>
            Options
          </Button>
        </HStack>
      </Box>

      <Box overflowX="auto">
        <ChakraTable variant="simple" size="sm">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} color={textColor}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id} color={textColor}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </ChakraTable>
      </Box>
    </Box>
  );
};

const JournalEntriesComponent: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false); // State for showing options
  const [totalNetProfit, setTotalNetProfit] = useState<number | null>(null);
  const [isLoadingProfit, setIsLoadingProfit] = useState(false);

  const {
    deleteJournalEntry,
    insertJournalEntry,
    updateJournalEntry,
    selectJournalEntry,
  } = useJournalEntries();

  const [formData, setFormData] = useState<JournalEntry>({
    id: "",
    symbol: "",
    trade_type: "Buy",
    order_type: "Limit",
    number_shares: 0,
    entry_price: 0,
    exit_price: 0,
    stop_loss: 0,
    take_profit: 0,
    commissions: 0,
    entry_date: "",
    exit_date: "",
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const result = await selectJournalEntry();
        console.log("Fetched entries:", result); // Debugging
        setJournalEntries(result || []);
      } catch (err) {
        console.error("Error fetching journal entries:", err);
        setJournalEntries([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, [selectJournalEntry]);

  // Fetch total net profit from supabase
  useEffect(() => {
    const fetchTotalNetProfit = async () => {
      setIsLoadingProfit(true);
      try {
        const user_uuid = "your-user-uuid"; // Replace with actual user UUID
        const { data, error } = await supabase.rpc("total_net_profit", {
          user_uuid,
        });
        if (error) {
          console.error("Error fetching total net profit:", error);
        } else {
          setTotalNetProfit(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoadingProfit(false);
      }
    };
    fetchTotalNetProfit();
  }, []);

  // Fixed handleChange function with correct field name mapping
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "number_shares" ||
        name === "entry_price" ||
        name === "exit_price" ||
        name === "stop_loss" ||
        name === "take_profit" ||
        name === "commissions"
          ? value === ""
            ? 0
            : parseFloat(value) || 0 // Convert to number, default to 0
          : value, // Keep other fields as strings
    }));
  };

  // Function to populate form when editing
  const populateFormForEdit = (entryId: string) => {
    const entry = journalEntries.find((e) => e.id === entryId);
    if (entry) {
      setFormData({
        id: entry.id,
        symbol: entry.symbol || "",
        trade_type: entry.trade_type || "Buy",
        order_type: entry.order_type || "Limit",
        number_shares: entry.number_shares || 0,
        entry_price: entry.entry_price || 0,
        exit_price: entry.exit_price || 0,
        stop_loss: entry.stop_loss || 0,
        take_profit: entry.take_profit || 0,
        commissions: entry.commissions || 0,
        entry_date: entry.entry_date || "",
        exit_date: entry.exit_date || "",
      });
    }
  };

  // Reset form for new entry
  const resetForm = () => {
    setFormData({
      id: "",
      symbol: "",
      trade_type: "Buy",
      order_type: "Limit",
      number_shares: 0,
      entry_price: 0,
      exit_price: 0,
      stop_loss: 0,
      take_profit: 0,
      commissions: 0,
      entry_date: "",
      exit_date: "",
    });
  };

  // Handle entry submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (selectedEntryId) {
        await updateJournalEntry({
          ...formData,
          p_entry_id: formData.id, // Ensure 'p_entry_id' is used for updates
        }); // Update the existing entry
      } else {
        await insertJournalEntry({
          p_symbol: formData.symbol,
          p_trade_type: formData.trade_type,
          p_order_type: formData.order_type,
          p_number_shares: formData.number_shares,
          p_entry_price: formData.entry_price,
          p_exit_price: formData.exit_price,
          p_stop_loss: formData.stop_loss,
          p_take_profit: formData.take_profit,
          p_commissions: formData.commissions,
          p_entry_date: formData.entry_date,
          p_exit_date: formData.exit_date,
        });
      }
      const result = await selectJournalEntry();
      setJournalEntries(result || []);
      resetForm(); // Reset form after successful submission
      onClose();
      toast.success("Entry saved successfully");
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to save entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteJournalEntry(entryId);
      const result = await selectJournalEntry();
      setJournalEntries(result || []);
      toast.success("Entry deleted successfully");
    } catch (err) {
      console.error("Error deleting entry:", err);
      toast.error("Failed to delete entry. Please try again.");
    }
  };

  // Handle entry selection for editing
  {
    /*const handleSelectEntry = (id: string | null) => {
    setSelectedEntryId(id);
    if (id) {
      populateFormForEdit(id);
    } else {
      resetForm();
    }
    onOpen();
  };*/
  }
  const handleSelectEntry = (id: string | null) => {
    setSelectedEntryId(id);
    if (id) {
      const entry = journalEntries.find((e) => e.id === id);
      if (entry) {
        setFormData(entry);
      }
    } else {
      setFormData({
        id: "",
        symbol: "",
        trade_type: "Buy",
        order_type: "Limit",
        number_shares: 0,
        entry_price: 0,
        exit_price: 0,
        stop_loss: 0,
        take_profit: 0,
        commissions: 0,
        entry_date: "",
        exit_date: "",
      });
    }
    onOpen();
  };

  const handleViewOptions = () => {
    setShowOptions(true);
  };

  // TODO: Add a loading state
  return (
      <div
        className="min-h-screen"
        style={{
          background: useColorModeValue(
            "linear-gradient(to-br, white, gray.100)",
            "linear-gradient(to-br, slate.900, purple.900)",
          ),
          color: useColorModeValue("black", "white"),
        }}
      >
        <div className="container mx-auto mt-10">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Box as="h2" fontSize="2xl" fontWeight="bold">
              Journal Entries
            </Box>
            <Button colorScheme="blue" isLoading={isLoadingProfit}>
          {isLoadingProfit
            ? "Loading..."
            : `Total Net Profit: ${totalNetProfit ?? "N/A"}`}
        </Button>
      </Box>
          {!showOptions ? (
            <JournalEntriesTable
              journalEntries={journalEntries}
              onSelectEntry={handleSelectEntry}
              onDeleteEntry={(id) => {
                deleteJournalEntry(id);
              }}
              isLoading={isLoading}
              onViewOptions={handleViewOptions} // Pass the handler
            />
          ) : (
            <JournalOptionsComponent
              onViewEntries={() => setShowOptions(false)}
            />
          )}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {selectedEntryId ? "Edit Entry" : "Add New Entry"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <form onSubmit={handleSubmit}>
                  <FormControl mb={4}>
                    <FormLabel>Symbol</FormLabel>
                    <Input
                      name="symbol"
                      value={formData.symbol}
                      onChange={handleChange}
                      placeholder="(e.g., AAPL)"
                    />
                  </FormControl>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Trade Type</FormLabel>
                        <Select
                          name="trade_type"
                          value={formData.trade_type}
                          onChange={handleChange}
                        >
                          <option value="Buy">Buy</option>
                          <option value="Sell">Sell</option>
                        </Select>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Order Type</FormLabel>
                        <Input
                          name="order_type"
                          value={formData.order_type}
                          onChange={handleChange}
                          placeholder="Limit"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Entry Price</FormLabel>
                        <Input
                          type="number"
                          name="entry_price"
                          value={formData.entry_price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Exit Price</FormLabel>
                        <Input
                          type="number"
                          name="exit_price"
                          value={formData.exit_price}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Stop Loss</FormLabel>
                        <Input
                          type="number"
                          name="stop_loss"
                          value={formData.stop_loss}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Take Profit</FormLabel>
                        <Input
                          type="number"
                          name="take_profit"
                          value={formData.take_profit}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Number of Shares</FormLabel>
                        <Input
                          type="number"
                          name="number_shares"
                          value={formData.number_shares}
                          onChange={handleChange}
                          placeholder="0"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Commissions</FormLabel>
                        <Input
                          type="number"
                          step="0.01"
                          name="commissions"
                          value={formData.commissions}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Entry Date</FormLabel>
                        <Input
                          type="date"
                          name="entry_date"
                          value={formData.entry_date}
                          onChange={handleChange}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Exit Date</FormLabel>
                        <Input
                          type="date"
                          name="exit_date"
                          value={formData.exit_date}
                          onChange={handleChange}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                  <Button
                    type="submit"
                    mt={4}
                    colorScheme="blue"
                    isLoading={isLoading}
                    loadingText="Saving..."
                    width="full"
                  >
                    {selectedEntryId ? "Update Entry" : "Add Entry"}
                  </Button>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>
        </div>
      </div>
  );
};

export default JournalEntriesComponent;
