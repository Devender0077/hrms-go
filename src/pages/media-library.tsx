import React, { useState } from 'react';
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea, Select, SelectItem, Image, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import HeroSection from '../components/common/HeroSection';

interface MediaFile {
  id: number;
  name: string;
  type: 'image' | 'document' | 'video';
  size: number;
  url: string;
  category: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
}

const MediaLibrary: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: 1,
      name: "company-logo.png",
      type: "image",
      size: 245760,
      url: "/placeholder-logo.png",
      category: "Branding",
      description: "Company logo for official use",
      uploaded_by: "Admin User",
      uploaded_at: "2024-01-15"
    },
    {
      id: 2,
      name: "employee-handbook.pdf",
      type: "document",
      size: 2048576,
      url: "/placeholder-document.pdf",
      category: "Documents",
      description: "Employee handbook and policies",
      uploaded_by: "HR Manager",
      uploaded_at: "2024-01-20"
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    file: null as File | null
  });

  const categories = [
    "Branding",
    "Documents",
    "Images",
    "Videos",
    "Templates",
    "Archives"
  ];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return 'lucide:image';
      case 'document':
        return 'lucide:file-text';
      case 'video':
        return 'lucide:video';
      default:
        return 'lucide:file';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;
    
    const newFile: MediaFile = {
      id: mediaFiles.length + 1,
      name: formData.file.name,
      type: formData.file.type.startsWith('image/') ? 'image' : 
            formData.file.type.startsWith('video/') ? 'video' : 'document',
      size: formData.file.size,
      url: URL.createObjectURL(formData.file),
      category: formData.category,
      description: formData.description,
      uploaded_by: "Current User",
      uploaded_at: new Date().toISOString().split('T')[0]
    };
    
    setMediaFiles([...mediaFiles, newFile]);
    setFormData({
      name: '',
      category: '',
      description: '',
      file: null
    });
    onOpenChange();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
        {/* Hero Section */}
        <HeroSection
          title="Media Library"
          subtitle="File Management"
          description="Manage and organize your company's media files, documents, and digital assets in one centralized location."
          icon="lucide:image"
          illustration="file-manager"
          actions={[
            {
              label: "Upload Files",
              icon: "lucide:upload",
              onPress: onOpen,
              variant: "solid"
            },
            {
              label: "Create Folder",
              icon: "lucide:folder-plus",
              onPress: () => {},
              variant: "bordered"
            }
          ]}
        />

        {/* Media Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Icon icon={getFileIcon(file.type)} className="text-primary text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{file.name}</h3>
                      <p className="text-xs text-default-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                </div>
                
                {file.type === 'image' && (
                  <div className="mb-3">
                    <Image
                      src={file.url}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiA4QzEzLjEwNDYgOCAxNCA3LjEwNDU3IDE0IDZDMTQgNC44OTU0MyAxMy4xMDQ2IDQgMTIgNEMxMC44OTU0IDQgMTAgNC44OTU0MyAxMCA2QzEwIDcuMTA0NTcgMTAuODk1NCA4IDEyIDhaIiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0xMiAxMEMxMy4xMDQ2IDEwIDE0IDEwLjg5NTQgMTQgMTJDMTQgMTMuMTA0NiAxMy4xMDQ2IDE0IDEyIDE0QzEwLjg5NTQgMTQgMTAgMTMuMTA0NiAxMCAxMkMxMCAxMC44OTU0IDEwLjg5NTQgMTAgMTIgMTBaIiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0xMiAxNkMxMy4xMDQ2IDE2IDE0IDE2Ljg5NTQgMTQgMThDMTQgMTkuMTA0NiAxMy4xMDQ2IDIwIDEyIDIwQzEwLjg5NTQgMjAgMTAgMTkuMTA0NiAxMCAxOEMxMCAxNi44OTU0IDEwLjg5NTQgMTYgMTIgMTZaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo="
                    />
                  </div>
                )}
                
                <div className="space-y-2 mb-3">
                  <Chip color="primary" variant="flat" size="sm">
                    {file.category}
                  </Chip>
                  <p className="text-xs text-default-600 line-clamp-2">{file.description}</p>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-2 text-xs text-default-500">
                    <Icon icon="lucide:user" className="w-3 h-3" />
                    <span>{file.uploaded_by}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-default-500">
                    <Icon icon="lucide:calendar" className="w-3 h-3" />
                    <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="flat" color="primary" className="flex-1">
                    <Icon icon="lucide:download" className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="flat" color="default" className="flex-1">
                    <Icon icon="lucide:eye" className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="flat" color="danger" className="flex-1">
                    <Icon icon="lucide:trash-2" className="w-3 h-3" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Upload Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Upload Media Files</ModalHeader>
                <form onSubmit={handleSubmit}>
                  <ModalBody>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-default-300 rounded-lg p-6 text-center">
                        <Icon icon="lucide:upload" className="w-12 h-12 text-default-400 mx-auto mb-4" />
                        <p className="text-default-600 mb-2">Drag and drop files here, or click to select</p>
                        <input
                          type="file"
                          multiple
                          onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload">
                          <Button as="span" variant="flat" color="primary">
                            Choose Files
                          </Button>
                        </label>
                        {formData.file && (
                          <p className="text-sm text-success mt-2">{formData.file.name}</p>
                        )}
                      </div>
                      
                      <Select
                        label="Category"
                        placeholder="Select category"
                        selectedKeys={[formData.category]}
                        onSelectionChange={(keys) => setFormData({...formData, category: Array.from(keys)[0] as string})}
                        isRequired
                      >
                        {categories.map((category) => (
                          <SelectItem key={category}>{category}</SelectItem>
                        ))}
                      </Select>
                      
                      <Textarea
                        label="Description"
                        placeholder="Enter file description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isDisabled={!formData.file}>
                      Upload Files
                    </Button>
                  </ModalFooter>
                </form>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default MediaLibrary;
