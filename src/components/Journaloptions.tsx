import React, { useState, useEffect } from "react";
import { useJournalOptions } from "../hook2/Journaloptions";
import { useColorModeValue } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import { toast } from "sonner";
import { Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Optionsfilter from "../hook2/Optionsfilter";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

interface OptionPayload {
  id?: string; // Optional for new entries
  symbol: string;
  trade_type?: string; // Optional for compatibility
  order_type: string;
  number_contracts: number;
  strike_price: number;
  premium?: number; // Optional for compatibility
  expiration_date: string;
  commissions: number;
  user_id?: string; // Optional for compatibility
  strategy?: string; // Optional for compatibility
  option_type?: string; // Optional for compatibility
  entry_price?: number; // Optional for compatibility
  implied_volatility?: number; // Optional for compatibility
  entry_date?: string; // Optional for compatibility
  exit_price?: number | null; // Added for compatibility
  exit_date?: string; // Optional for compatibility
}

// Animate Table rows
const MotionTr = motion(Tr);

const JournalOptionsComponent: React.FC<{ onViewEntries: () => void }> = ({
  onViewEntries,
}) => {
  const { insertOption, updateOption, deleteOption, selectOptions, options } =
    useJournalOptions();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OptionPayload>({
    symbol: "",
    trade_type: "Call",
    order_type: "Limit",
    number_contracts: 0,
    strike_price: 0,
    premium: 0,
    expiration_date: "",
    commissions: 0,
    strategy: "",
    option_type: "",
    entry_price: 0,
    implied_volatility: 0,
    entry_date: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const rowHoverBg = useColorModeValue("#f0f0f0", "whiteAlpha.200");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const result = await selectOptions();
        console.log("Fetched options:", result);
      } catch (err) {
        console.error("Error fetching options:", err);
        toast.error("Failed to fetch options. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, [selectOptions]);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]:
        name === "number_contracts" ||
        name === "strike_price" ||
        name === "premium" ||
        name === "commissions" ||
        name === "entry_price" ||
        name === "implied_volatility"
          ? value === ""
            ? 0
            : parseFloat(value) || 0 // Convert to number, default is 0 if NaN
          : value, // Keep other fields as strings
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      symbol: "",
      trade_type: "Call",
      order_type: "Limit",
      number_contracts: 0,
      strike_price: 0,
      premium: 0,
      expiration_date: "",
      commissions: 0,
      strategy: "",
      option_type: "",
      entry_price: 0,
      implied_volatility: 0,
      entry_date: "",
    });
    setSelectedOptionId(null); // Reset selected option ID
  };

  // Populate form for edit
  const populateFormForEdit = (optionId: string) => {
    const option = options.find((o) => o.id === optionId);
    if (option) {
      setFormData({
        symbol: option.symbol || "",
        order_type: option.order_type || "Limit",
        number_contracts: option.number_contracts || 0,
        strike_price: option.strike_price || 0,
        expiration_date: option.expiration_date || "",
        commissions: option.commissions || 0,
        strategy: option.strategy || "",
        option_type: option.option_type || "",
        entry_price: option.entry_price || 0,
        implied_volatility: option.implied_volatility || 0,
        entry_date: option.entry_date || "",
      });
    }
  };

  // Handle form submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.symbol.trim()) {
      toast.error("Symbol is required.");
      return;
    }

    if (formData.number_contracts <= 0) {
      toast.error("Number of contracts must be greater than 0.");
      return;
    }

    if (formData.strike_price <= 0) {
      toast.error("Strike price must be greater than 0.");
      return;
    }

    if (!formData.expiration_date) {
      toast.error("Expiration date is required.");
      return;
    }

    if (!formData.option_type || formData.option_type.length > 4) {
      toast.error("Option type must be 4 characters or less.");
    }

    console.log("Submitting payload:", formData); // Debugging payload

    try {
      setIsLoading(true);

      const payload = {
        ...formData,
        user_id: formData.user_id || "", // Ensure user_id is provided
        symbol: formData.symbol.trim(),
        strategy: formData.strategy || "",
        option_type: formData.option_type || "",
        strike_price: formData.strike_price,
        expiration_date: formData.expiration_date || "",
        entry_price: formData.entry_price || 0,
        number_contracts:
          typeof formData.number_contracts === "number"
            ? formData.number_contracts
            : 0,
        exit_price: formData.exit_price || null,
        commissions: formData.commissions || 0,
        order_type: formData.order_type || "",
        implied_volatility: formData.implied_volatility || 0,
        entry_date: formData.entry_date || "",
        exit_date: formData.exit_date || "",
      };

      if (selectedOptionId) {
        await updateOption({
          ...payload,
          id: selectedOptionId || "",
        });
        toast.success("Option updated successfully!");
      } else {
        await insertOption(payload);
        toast.success("Option added successfully!");
      }
      // Refresh the options list
      await selectOptions();
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorMessage = selectedOptionId
        ? "Failed to update option. Please try again."
        : "Failed to add option. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle option deletion
  const handleDeleteOption = async (optionId: string) => {
    // Add confirmation dialog
    if (!window.confirm("Are you sure you want to delete this option?")) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteOption(optionId);
      await selectOptions(); // Refresh the list
      toast.success("Option deleted successfully!");
    } catch (err) {
      console.error("Error deleting option:", err);
      toast.error("Error deleting option. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle option selection for editing
  const handleSelectOption = (id: string | null) => {
    setSelectedOptionId(id);
    if (id) {
      populateFormForEdit(id);
    } else {
      resetForm();
    }
    onOpen();
  };

  // Handle modal close
  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  
  const columns: ColumnDef<OptionPayload, any>[] = [
    { accessorKey: "symbol", header: "Symbol" },
    { accessorKey: "strategy", header: "Strategy" },
    { accessorKey: "option_type", header: "Option Type" },
    { accessorKey: "strike_price", header: "Strike Price" },
    { accessorKey: "expiration_date", header: "Expiration Date" },
    { accessorKey: "entry_price", header: "Entry Price" },
    { accessorKey: "number_contracts", header: "Contracts" },
    { accessorKey: "exit_price", header: "Exit Price" },
    { accessorKey: "commissions", header: "Commissions" },
    { accessorKey: "order_type", header: "Order Type" },
    { accessorKey: "implied_volatility", header: "Implied Volatility" },
    { accessorKey: "entry_date", header: "Entry Date" },
    { accessorKey: "exit_date", header: "Exit Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => handleSelectOption(row.original.id ?? null)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => handleDeleteOption(row.original.id || "")}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  const table = useReactTable({
    data: options || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  // UI rendering
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
      <Optionsfilter />;
        <Box
          bg="whiteAlpha.100"
          backdropFilter="blur(5px)"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.300"
          p={6}
          mb={6}
          mt={5}
          w="100%"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Box as="h2" fontSize="2xl" fontWeight="bold">
              Options ({options?.length || 0})
              {isLoading && <Spinner size="sm" ml={2} color="whiteAlpha.600" />}
            </Box>
            <HStack spacing={4}>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                colorScheme="blue"
                onClick={() => handleSelectOption(null)}
                isDisabled={isLoading}
              >
                New Entry
              </Button>
              <Button
                as={motion.button}
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                colorScheme="green"
                onClick={onViewEntries}
                isDisabled={isLoading}
              >
                Stocks
              </Button>
            </HStack>
          </Box>

          <Box overflowX="auto">
            <ChakraTable variant="simple" size="sm" width="100%">
              <Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Th key={header.id}>
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
                {table.getRowModel().rows.map((row, idx) => (
                  <MotionTr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    whileHover={{
                      scale: 1.01,
                      backgroundColor: rowHoverBg,
                      transition: { duration: 0.2 },
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </Td>
                    ))}
                  </MotionTr>
                ))}
              </Tbody>
            </ChakraTable>
          </Box>
        </Box>

        <Modal isOpen={isOpen} onClose={handleModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedOptionId ? "Edit Option" : "Add New Option"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
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
                      <FormLabel>Strategy</FormLabel>
                      <Select
                        name="strategy"
                        value={formData.strategy}
                        onChange={handleChange}
                      >
                        <option value="Call">Call</option>
                        <option value="Put">Put</option>
                        <option value="Straddle">Straddle</option>
                        <option value="Strangle">Strangle</option>
                        <option value="Short Straddle">Short Straddle</option>
                        <option value="Short Strangle">Short Strangle</option>
                        <option value="Cash Secured puts">
                          Cash Secured puts
                        </option>
                        <option value="Covered Call">Covered Call</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Option Type</FormLabel>
                      <Input
                        name="option_type"
                        value={formData.option_type}
                        onChange={handleChange}
                        placeholder="Call"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Strike Price</FormLabel>
                      <Input
                        type="number"
                        name="strike_price"
                        value={formData.strike_price}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Expiration Date</FormLabel>
                      <Input
                        type="date"
                        name="expiration_date"
                        value={formData.expiration_date}
                        onChange={handleChange}
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
                      <FormLabel>Number of Contracts</FormLabel>
                      <Input
                        type="number"
                        name="number_contracts"
                        value={formData.number_contracts}
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
                        value={formData.exit_price || ""}
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
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Order Type</FormLabel>
                      <Select
                        name="entry_date"
                        value={formData.order_type}
                        onChange={handleChange}
                      >
                        <option value="Limit">Limit</option>
                        <option value="Market">Market</option>
                      </Select>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel>Implied Volatility</FormLabel>
                      <Input
                        type="number"
                        name="implied_volatility"
                        value={formData.implied_volatility}
                        onChange={handleChange}
                        placeholder="10%"
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

                <HStack spacing={4} mt={6}>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isLoading}
                    loadingText={selectedOptionId ? "Updating..." : "Adding..."}
                    flex={1}
                  >
                    {selectedOptionId ? "Update Option" : "Add Option"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                </HStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default JournalOptionsComponent;
