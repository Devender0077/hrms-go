import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner
} from '@heroui/react';
import { SearchIcon, FilterIcon } from 'lucide-react';
import { apiRequest } from '../../services/api-service';

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  description: string;
  module: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role_count: number;
}

const PermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [modules, setModules] = useState<string[]>([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    filterPermissions();
  }, [permissions, searchTerm, selectedModule]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/v1/permissions');
      if (response.success) {
        const data = response.data || [];
        setPermissions(data);
        
        // Extract unique modules
        const uniqueModules = [...new Set(data.map((p: Permission) => p.module))];
        setModules(uniqueModules);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPermissions = () => {
    let filtered = permissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(permission =>
        permission.permission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.permission_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(permission => permission.module === selectedModule);
    }

    setFilteredPermissions(filtered);
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      'dashboard': 'primary',
      'employees': 'secondary',
      'leave': 'success',
      'attendance': 'warning',
      'payroll': 'danger',
      'reports': 'default',
      'users': 'primary',
      'calendar': 'secondary',
      'tasks': 'success',
      'organization': 'warning',
      'recruitment': 'danger',
      'performance': 'default',
      'assets': 'primary',
      'documents': 'secondary',
      'settings': 'success'
    };
    return colors[module] || 'default';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'danger';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Permission Management</h1>
          <p className="text-default-600">View and manage system permissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<SearchIcon size={20} />}
                size="sm"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                placeholder="Filter by module"
                selectedKeys={selectedModule ? [selectedModule] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedModule(selected || 'all');
                }}
                startContent={<FilterIcon size={20} />}
                size="sm"
              >
                <SelectItem key="all" value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Permissions Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Permissions ({filteredPermissions.length})
          </h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Permissions table">
            <TableHeader>
              <TableColumn>PERMISSION</TableColumn>
              <TableColumn>MODULE</TableColumn>
              <TableColumn>DESCRIPTION</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ROLES</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{permission.permission_name}</div>
                      <div className="text-sm text-default-500">{permission.permission_key}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getModuleColor(permission.module)}
                      size="sm"
                      variant="flat"
                    >
                      {permission.module}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="text-default-600">{permission.description}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(permission.is_active)}
                      size="sm"
                      variant="flat"
                    >
                      {permission.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color="default"
                      size="sm"
                      variant="flat"
                    >
                      {permission.role_count} roles
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{permissions.length}</div>
              <div className="text-sm text-default-600">Total Permissions</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {permissions.filter(p => p.is_active).length}
              </div>
              <div className="text-sm text-default-600">Active Permissions</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{modules.length}</div>
              <div className="text-sm text-default-600">Modules</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PermissionsPage;
