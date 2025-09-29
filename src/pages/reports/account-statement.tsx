import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Account Statement data interface
interface AccountStatementRecord {
  id: number;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  balance: number;
  reference: string;
  department: string;
  status: "cleared" | "pending" | "reconciled";
}

// Sample data
const accountStatementData: AccountStatementRecord[] = [
  {
    id: 1,
    date: "2025-01-15",
    description: "Employee Salaries - January",
    category: "Payroll",
    type: "expense",
    amount: 85000,
    balance: 150000,
    reference: "PAY-001",
    department: "All",
    status: "cleared"
  },
  {
    id: 2,
    date: "2025-01-16",
    description: "Office Rent",
    category: "Rent",
    type: "expense",
    amount: 12000,
    balance: 138000,
    reference: "RENT-001",
    department: "All",
    status: "cleared"
  },
  {
    id: 3,
    date: "2025-01-17",
    description: "Client Payment - Project Alpha",
    category: "Revenue",
    type: "income",
    amount: 50000,
    balance: 188000,
    reference: "INV-001",
    department: "IT",
    status: "cleared"
  },
  {
    id: 4,
    date: "2025-01-18",
    description: "Marketing Campaign",
    category: "Marketing",
    type: "expense",
    amount: 15000,
    balance: 173000,
    reference: "MKT-001",
    department: "Marketing",
    status: "pending"
  },
  {
    id: 5,
    date: "2025-01-19",
    description: "Equipment Purchase",
    category: "Equipment",
    type: "expense",
    amount: 25000,
    balance: 148000,
    reference: "EQ-001",
    department: "IT",
    status: "reconciled"
  },
  {
    id: 6,
    date: "2025-01-20",
    description: "Client Payment - Project Beta",
    category: "Revenue",
    type: "income",
    amount: 75000,
    balance: 223000,
    reference: "INV-002",
    department: "IT",
    status: "cleared"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const categories = ["All", "Payroll", "Rent", "Revenue", "Marketing", "Equipment", "Utilities", "Travel"];
const types = ["All", "income", "expense"];

const typeColorMap = {
  income: "success",
  expense: "danger",
};

const statusColorMap = {
  cleared: "success",
  pending: "warning",
  reconciled: "primary",
};

export default function AccountStatementReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return accountStatementData.filter(record => {
      const matchesSearch = 
        record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.reference.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesCategory = selectedCategory === "All" || record.category === selectedCategory;
      const matchesType = selectedType === "All" || record.type === selectedType;
      
      return matchesSearch && matchesDepartment && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedDepartment, selectedCategory, selectedType]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = accountStatementData
      .filter(record => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);
    const totalExpense = accountStatementData
      .filter(record => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);
    const currentBalance = accountStatementData[accountStatementData.length - 1]?.balance || 0;
    const totalTransactions = accountStatementData.length;
    
    return [
      {
        label: "Total Income",
        value: `$${(totalIncome / 1000).toFixed(0)}k`,
        icon: "lucide:trending-up",
        color: "text-success-600",
        bgColor: "bg-success-100"
      },
      {
        label: "Total Expense",
        value: `$${(totalExpense / 1000).toFixed(0)}k`,
        icon: "lucide:trending-down",
        color: "text-danger-600",
        bgColor: "bg-danger-100"
      },
      {
        label: "Current Balance",
        value: `$${(currentBalance / 1000).toFixed(0)}k`,
        icon: "lucide:wallet",
        color: "text-primary-600",
        bgColor: "bg-primary-100"
      },
      {
        label: "Total Transactions",
        value: totalTransactions,
        icon: "lucide:receipt",
        color: "text-secondary-600",
        bgColor: "bg-secondary-100"
      }
    ];
  }, []);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast({
        title: "Export Successful",
        description: "Account statement report has been exported successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Export Failed",
        description: "Failed to export the report. Please try again.",
        color: "danger",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast({
        title: "Data Refreshed",
        description: "Account statement data has been refreshed successfully.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Refresh Failed",
        description: "Failed to refresh the data. Please try again.",
        color: "danger",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-content2 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ReportHeader
          title="Account Statement Report"
          description="Comprehensive financial account statement and transaction history"
          icon="lucide:receipt"
          iconColor="from-secondary-500 to-primary-600"
          onExport={handleExport}
          onRefresh={handleRefresh}
          isExporting={isExporting}
          isRefreshing={isRefreshing}
        />
        
        {/* Statistics */}
        <ReportStats stats={stats} />

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="flex items-end">
                <div className="text-sm text-default-600">
                  Showing {filteredData.length} of {accountStatementData.length} records
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-secondary-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Account Statement</h3>
                <p className="text-default-500 text-sm">Financial transaction history and balances</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Account statement table">
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>BALANCE</TableColumn>
                <TableColumn>REFERENCE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{new Date(record.date).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{record.description}</p>
                        <p className="text-sm text-default-500">{record.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">
                        {record.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={typeColorMap[record.type] as any}
                        variant="flat"
                      >
                        {record.type}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-2 ${record.type === 'income' ? 'text-success-600' : 'text-danger-600'}`}>
                        <Icon 
                          icon={record.type === 'income' ? 'lucide:plus' : 'lucide:minus'} 
                          className="w-4 h-4" 
                        />
                        <span className="font-medium">
                          ${record.type === 'income' ? '+' : '-'}${(record.amount / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:wallet" className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary-600">${(record.balance / 1000).toFixed(0)}k</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-mono text-default-600">{record.reference}</p>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[record.status] as any}
                        variant="flat"
                      >
                        {record.status}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredData.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={Math.ceil(filteredData.length / rowsPerPage)}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
