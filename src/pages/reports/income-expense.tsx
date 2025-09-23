import React, { useState, useMemo } from "react";
import { Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Pagination } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/react";
import ReportHeader from "../../components/reports/ReportHeader";
import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

// Income vs Expense data interface
interface IncomeExpenseRecord {
  id: number;
  month: string;
  income: number;
  expense: number;
  profit: number;
  profitMargin: number;
  category: string;
  department: string;
  status: "completed" | "pending" | "draft";
}

// Sample data
const incomeExpenseData: IncomeExpenseRecord[] = [
  {
    id: 1,
    month: "January 2025",
    income: 120000,
    expense: 85000,
    profit: 35000,
    profitMargin: 29.2,
    category: "Monthly",
    department: "All",
    status: "completed"
  },
  {
    id: 2,
    month: "February 2025",
    income: 135000,
    expense: 92000,
    profit: 43000,
    profitMargin: 31.9,
    category: "Monthly",
    department: "All",
    status: "completed"
  },
  {
    id: 3,
    month: "March 2025",
    income: 128000,
    expense: 88000,
    profit: 40000,
    profitMargin: 31.3,
    category: "Monthly",
    department: "All",
    status: "completed"
  },
  {
    id: 4,
    month: "April 2025",
    income: 142000,
    expense: 95000,
    profit: 47000,
    profitMargin: 33.1,
    category: "Monthly",
    department: "All",
    status: "pending"
  },
  {
    id: 5,
    month: "May 2025",
    income: 138000,
    expense: 91000,
    profit: 47000,
    profitMargin: 34.1,
    category: "Monthly",
    department: "All",
    status: "draft"
  }
];

const departments = ["All", "IT", "HR", "Finance", "Marketing", "Operations"];
const categories = ["All", "Monthly", "Quarterly", "Yearly"];

const statusColorMap = {
  completed: "success",
  pending: "warning",
  draft: "default",
};

export default function IncomeExpenseReport() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const rowsPerPage = 10;
  
  // Filter data
  const filteredData = useMemo(() => {
    return incomeExpenseData.filter(record => {
      const matchesSearch = 
        record.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "All" || record.department === selectedDepartment;
      const matchesCategory = selectedCategory === "All" || record.category === selectedCategory;
      
      return matchesSearch && matchesDepartment && matchesCategory;
    });
  }, [searchQuery, selectedDepartment, selectedCategory]);
  
  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = incomeExpenseData.reduce((sum, record) => sum + record.income, 0);
    const totalExpense = incomeExpenseData.reduce((sum, record) => sum + record.expense, 0);
    const totalProfit = incomeExpenseData.reduce((sum, record) => sum + record.profit, 0);
    const avgProfitMargin = incomeExpenseData.reduce((sum, record) => sum + record.profitMargin, 0) / incomeExpenseData.length;
    
    return [
      {
        label: "Total Income",
        value: `$${(totalIncome / 1000).toFixed(0)}k`,
        icon: "lucide:trending-up",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        label: "Total Expense",
        value: `$${(totalExpense / 1000).toFixed(0)}k`,
        icon: "lucide:trending-down",
        color: "text-red-600",
        bgColor: "bg-red-100"
      },
      {
        label: "Total Profit",
        value: `$${(totalProfit / 1000).toFixed(0)}k`,
        icon: "lucide:dollar-sign",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        label: "Avg Profit Margin",
        value: `${avgProfitMargin.toFixed(1)}%`,
        icon: "lucide:percent",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      }
    ];
  }, []);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      addToast({
        title: "Export Successful",
        description: "Income vs Expense report has been exported successfully.",
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
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast({
        title: "Data Refreshed",
        description: "Income vs Expense data has been refreshed successfully.",
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
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <ReportHeader
          title="Income vs Expense Report"
          description="Comprehensive financial analysis and profit tracking"
          icon="lucide:dollar-sign"
          iconColor="from-green-500 to-blue-600"
          onExport={handleExport}
          onRefresh={handleRefresh}
          isExporting={isExporting}
          isRefreshing={isRefreshing}
        />
        
        {/* Statistics */}
        <ReportStats stats={stats} />

        {/* Filters */}
        <ReportFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFilter={selectedDepartment}
          onFilterChange={setSelectedDepartment}
          filterOptions={departments.map(dept => ({ key: dept, label: dept }))}
          filterLabel="Department"
          additionalFilters={
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredData.length} of {incomeExpenseData.length} records
              </div>
            </div>
          }
        />

        {/* Data Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:table" className="text-green-600 text-xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Income vs Expense Data</h3>
                <p className="text-gray-500 text-sm">Monthly financial performance analysis</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Income vs Expense table">
              <TableHeader>
                <TableColumn>MONTH</TableColumn>
                <TableColumn>INCOME</TableColumn>
                <TableColumn>EXPENSE</TableColumn>
                <TableColumn>PROFIT</TableColumn>
                <TableColumn>PROFIT MARGIN</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{record.month}</p>
                        <p className="text-sm text-gray-500">{record.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:trending-up" className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-green-600">${(record.income / 1000).toFixed(0)}k</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:trending-down" className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-red-600">${(record.expense / 1000).toFixed(0)}k</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:dollar-sign" className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-600">${(record.profit / 1000).toFixed(0)}k</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${Math.min(record.profitMargin, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{record.profitMargin.toFixed(1)}%</span>
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
