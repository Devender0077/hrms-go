import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Checkbox,
  CheckboxGroup,
  Progress,
  Alert
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { 
  exportSettings, 
  importSettings, 
  downloadSettingsFile, 
  readSettingsFile,
  SETTINGS_CATEGORIES,
  SettingsCategory,
  SettingsExportData
} from '../../utils/settings-export-import';

interface SettingsExportImportProps {
  settings: Record<string, any>;
  onSettingsImport: (importedSettings: Record<string, any>) => void;
  currentUser: string;
}

export default function SettingsExportImport({ 
  settings, 
  onSettingsImport, 
  currentUser 
}: SettingsExportImportProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = () => {
    try {
      const exportData = exportSettings(
        settings, 
        selectedCategories.length > 0 ? selectedCategories : undefined,
        currentUser
      );
      
      const filename = selectedCategories.length > 0 
        ? `hrms-settings-${selectedCategories.join('-')}-${new Date().toISOString().split('T')[0]}.json`
        : `hrms-settings-full-${new Date().toISOString().split('T')[0]}.json`;
      
      downloadSettingsFile(exportData, filename);
      setIsExportModalOpen(false);
      setSelectedCategories([]);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);
    setImportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const exportData = await readSettingsFile(importFile);
      const importedSettings = importSettings(exportData);
      
      setImportProgress(100);
      clearInterval(progressInterval);
      
      onSettingsImport(importedSettings);
      setImportSuccess(true);
      
      setTimeout(() => {
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportProgress(0);
        setImportSuccess(false);
      }, 2000);
      
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setImportProgress(0);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportError(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon icon="lucide:download" className="text-primary-500 text-xl" />
            <h3 className="text-lg font-semibold text-foreground">Export & Import Settings</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="lucide:download" />}
              onPress={() => setIsExportModalOpen(true)}
              className="h-12"
            >
              Export Settings
            </Button>
            
            <Button
              color="secondary"
              variant="flat"
              startContent={<Icon icon="lucide:upload" />}
              onPress={() => setIsImportModalOpen(true)}
              className="h-12"
            >
              Import Settings
            </Button>
          </div>
          
          <div className="bg-default-50 p-4 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Export/Import Information:</h4>
            <ul className="text-sm text-default-600 space-y-1">
              <li>• Export creates a JSON file with your current settings</li>
              <li>• Import allows you to restore settings from a backup file</li>
              <li>• You can export specific categories or all settings</li>
              <li>• Import will merge with existing settings (does not replace all)</li>
              <li>• Always backup your settings before making major changes</li>
            </ul>
          </div>
        </CardBody>
      </Card>

      {/* Export Modal */}
      <Modal 
        isOpen={isExportModalOpen} 
        onOpenChange={setIsExportModalOpen}
        size="lg"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:download" className="text-primary-500 text-xl" />
              <h3 className="text-lg font-semibold">Export Settings</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-default-600">
                Choose which settings categories to export. Leave empty to export all settings.
              </p>
              
              <CheckboxGroup
                
                onValueChange={setSelectedCategories}
                className="max-h-60 overflow-y-auto"
              >
                {SETTINGS_CATEGORIES.map((category) => (
                  <Checkbox key={category.key} >
                    <div className="flex flex-col">
                      <span className="font-medium">{category.label}</span>
                      <span className="text-xs text-default-500">{category.description}</span>
                    </div>
                  </Checkbox>
                ))}
              </CheckboxGroup>
              
              <div className="bg-primary-50 p-3 rounded-lg">
                <p className="text-sm text-primary-700">
                  <Icon icon="lucide:info" className="inline mr-1" />
                  Export will include {selectedCategories.length === 0 ? 'all' : selectedCategories.length} 
                  {selectedCategories.length === 1 ? ' category' : ' categories'} of settings.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => setIsExportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleExport}
              startContent={<Icon icon="lucide:download" />}
            >
              Export Settings
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={isImportModalOpen} 
        onOpenChange={setIsImportModalOpen}
        size="lg"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Icon icon="lucide:upload" className="text-primary-500 text-xl" />
              <h3 className="text-lg font-semibold">Import Settings</h3>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {importSuccess && (
                <Alert color="success" startContent={<Icon icon="lucide:check-circle" />}>
                  Settings imported successfully!
                </Alert>
              )}
              
              {importError && (
                <Alert color="danger" startContent={<Icon icon="lucide:alert-circle" />}>
                  {importError}
                </Alert>
              )}
              
              {isImporting && (
                <div className="space-y-2">
                  <Progress  className="w-full" />
                  <p className="text-sm text-default-600 text-center">
                    Importing settings... {importProgress}%
                  </p>
                </div>
              )}
              
              {!isImporting && !importSuccess && (
                <>
                  <div className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center">
                    <Icon icon="lucide:file-json" className="text-4xl text-default-400 mx-auto mb-2" />
                    <p className="text-default-600 mb-4">
                      Select a settings file to import
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="settings-file-input"
                    />
                    <Button
                      as="label"
                      htmlFor="settings-file-input"
                      variant="bordered"
                      startContent={<Icon icon="lucide:folder-open" />}
                    >
                      Choose File
                    </Button>
                  </div>
                  
                  {importFile && (
                    <div className="bg-success-50 p-3 rounded-lg">
                      <p className="text-sm text-success-700">
                        <Icon icon="lucide:check" className="inline mr-1" />
                        Selected: {importFile.name}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-warning-50 p-3 rounded-lg">
                    <p className="text-sm text-warning-700">
                      <Icon icon="lucide:alert-triangle" className="inline mr-1" />
                      Importing settings will merge with existing settings. This action cannot be undone.
                    </p>
                  </div>
                </>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="light" 
              onPress={() => {
                setIsImportModalOpen(false);
                setImportFile(null);
                setImportError(null);
                setImportSuccess(false);
                setImportProgress(0);
              }}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleImport}
              isDisabled={!importFile || isImporting}
              startContent={<Icon icon="lucide:upload" />}
            >
              {isImporting ? 'Importing...' : 'Import Settings'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
