import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient"; // Import Supabase client
import { Select, useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  FileText,
  Settings,
  Library,
  User,
  LogOut,
  DollarSign,
  NotebookPen,
  Activity,
  ChartLine,
  ChartNoAxesColumnIncreasing,
  BrainCog,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Plus,
  Search,
} from "lucide-react";
import SettingsModal, { ThemeProvider } from "./Settings"; // New code 

// Define props for ModernSidebarItem
interface ModernSidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to?: string;
  onClick?: () => void;
  collapsed: boolean;
  small?: boolean;
}

function ModernSidebarItem({
  icon: Icon,
  label,
  to,
  onClick,
  collapsed,
  small,
}: ModernSidebarItemProps) {
  const location = useLocation();
  const isActive = to ? location.pathname === to : false;

  {
    /*function ModernSidebarItem({ icon: Icon, label, to, collapsed, small }) {
  const location = useLocation()
  const isActive = location.pathname === to*/
  }

  return (
    <Link
      to={to || "#"}
      onClick={onClick}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-blue-200 hover:bg-white/10 hover:text-white transition-colors ${
        isActive ? "bg-purple-600 text-white" : ""
      } ${collapsed ? "justify-center space-x-0" : ""}`}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && (
        <span className={`${small ? "text-xs" : "text-sm"}`}>{label}</span>
      )}
    </Link>
  );
}

// Define props for Sidebar
interface SidebarProps {
  onWidthChange?: (width: number) => void;
}

interface FormData {
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
}

export default function Sidebar({ onWidthChange }: SidebarProps) {
  const [isModernCollapsed, setIsModernCollapsed] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<FormData>({
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
  const navigate = useNavigate();

  // Settings modal state 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose();
  };

  // Notify parent component about width changes
  React.useEffect(() => {
    if (onWidthChange) {
      onWidthChange(isModernCollapsed ? 64 : 256); // 16 * 4 = 64px, 64 * 4 = 256px
    }
  }, [isModernCollapsed, onWidthChange]);

  // Sign out Logic
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/Login.jsx"); // Redirect to the login page after signing out
    }
  };

  return (
    <ThemeProvider>
    <div
      className={`${
        isModernCollapsed ? "w-16" : "w-64"
      } h-screen fixed top-0 left-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl border-r border-gray-700 flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isModernCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">TRADISTRY</h1>
                <p className="text-gray-300 text-xs">World class journal</p>
              </div>
            </div>
          )}
          {isModernCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsModernCollapsed(!isModernCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            {isModernCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          <ModernSidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            to="/Dashboard.jsx"
            collapsed={isModernCollapsed}
          />
          <ModernSidebarItem
            icon={Plus}
            label="New Trade"
            onClick={onOpen}
            collapsed={isModernCollapsed}
          />
        </div>

        {!isModernCollapsed && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-blue-200 text-xs font-semibold mb-2 px-3">
              TOOLS
            </p>
          </div>
        )}

        <div
          className={`${isModernCollapsed ? "pt-4 border-t border-white/10" : ""} space-y-1`}
        >
          <ModernSidebarItem
            icon={Calendar}
            label="Calendar"
            to="/Calendar.jsx"
            collapsed={isModernCollapsed}
          />
          <ModernSidebarItem
            icon={NotebookPen}
            label="Journal"
            to="/Journal.jsx"
            collapsed={isModernCollapsed}
          />
          <ModernSidebarItem
            icon={ChartLine}
            label="Analytics"
            to="/Analytics.jsx"
            collapsed={isModernCollapsed}
          />
          <ModernSidebarItem
            icon={Library}
            label="Notes"
            to="/Notes.jsx"
            collapsed={isModernCollapsed}
            />
          <ModernSidebarItem
            icon={ChartNoAxesColumnIncreasing}
            label="Performance"
            to="/Performance.jsx"
            collapsed={isModernCollapsed}
          />
          <ModernSidebarItem
            icon={BrainCog}
            label="Mindset Lab"
            to="/Mindset.jsx"
            collapsed={isModernCollapsed}
          />
        </div>
      </nav>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Trade </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4}>
                <FormLabel>Symbol</FormLabel>
                <Input
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="APPL"
                />
              </FormControl>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel>Order Type</FormLabel>
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
                      placeholder="Limit/Market"
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
              <Button type="submit" mt={4} colorScheme="blue" width="full">
                Save Trade
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {isModernCollapsed && (
          <div className="space-y-2 flex flex-col items-center">
            <button
              onClick={() => navigate("/Settings")} // Open settings page
              title="Settings"
              className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-300 hover:text-white" />
            </button>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-300 hover:text-white" />
            </button>
          </div>
        )}

        
        {!isModernCollapsed && (
          <div className="space-y-1">
            <button
              onClick={() => navigate("/Settings")} // Open modal instead of navigating
              className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </ThemeProvider>
  );
}
