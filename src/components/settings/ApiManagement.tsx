import React from 'react';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';

interface ApiManagementProps {
  settings: Record<string, any>;
  onSettingsChange: (field: string, value: any) => void;
  onCreateApiKey: () => void;
  onDeleteApiKey: (id: number) => void;
}

export default function ApiManagement({ settings, onCreateApiKey, onDeleteApiKey }: ApiManagementProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Icon icon="lucide:code" className="text-primary-600 dark:text-primary-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">API Management</h3>
            </div>
            <Button
              color="primary"
              onPress={onCreateApiKey}
              startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
              className="font-medium"
              size="sm"
            >
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="API Keys table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>API KEY</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>LAST USED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {settings.apiKeys?.map((key: any) => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-default-100 dark:bg-default-200 px-2 py-1 rounded font-mono">
                      {key.key}
                    </code>
                  </TableCell>
                  <TableCell>{key.created}</TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={key.lastUsed === 'Never' ? 'default' : 'success'}
                      variant="flat"
                    >
                      {key.lastUsed}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => onDeleteApiKey(key.id)}
                      startContent={<Icon icon="lucide:trash-2" className="w-3 h-3" />}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}