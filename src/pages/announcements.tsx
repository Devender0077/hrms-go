import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
  Divider,
  Badge,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { apiRequest } from '../utils/api';
import { usePusher } from '../contexts/pusher-context';
import { usePermissions } from '../hooks/usePermissions';
import DynamicPageTitle from '../components/common/DynamicPageTitle';
import HeroSection from '../components/common/HeroSection';
import { useTranslation } from '../contexts/translation-context';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  target_audience: 'all' | 'department' | 'designation' | 'specific_users';
  published_by: number;
  published_by_name: string;
  published_at: string;
  expires_at: string | null;
  is_active: boolean;
  read_count: number;
  total_reads: number;
  user_read_at: string | null;
  attachments: any[];
}

const priorityColors = {
  low: 'default',
  medium: 'primary',
  high: 'warning',
  urgent: 'danger',
} as const;

const priorityIcons = {
  low: 'lucide:info',
  medium: 'lucide:alert-circle',
  high: 'lucide:alert-triangle',
  urgent: 'lucide:alert-octagon',
};

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { hasPermission } = usePermissions();
  const { pusher } = usePusher();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium',
    category: 'general',
    target_audience: 'all',
    expires_at: '',
  });

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPriority) params.append('priority', filterPriority);
      if (filterCategory) params.append('category', filterCategory);

      const response = await apiRequest(`/announcements?${params.toString()}`);
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterCategory]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Pusher real-time updates
  useEffect(() => {
    if (!pusher) return;

    const channel = pusher.subscribe('announcements');
    
    channel.bind('new-announcement', (data: any) => {
      console.log('New announcement received via Pusher:', data);
      loadAnnouncements(); // Reload announcements
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe('announcements');
    };
  }, [pusher, loadAnnouncements]);

  const handleCreate = async () => {
    try {
      const response = await apiRequest('/announcements', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        onCreateClose();
        loadAnnouncements();
        setFormData({
          title: '',
          content: '',
          priority: 'medium',
          category: 'general',
          target_audience: 'all',
          expires_at: '',
        });
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleView = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    onViewOpen();

    // Mark as read if not already read
    if (!announcement.user_read_at) {
      try {
        await apiRequest(`/announcements/${announcement.id}/read`, {
          method: 'POST',
        });
        loadAnnouncements(); // Refresh to update read status
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('Are you sure you want to delete this announcement?'))) return;

    try {
      await apiRequest(`/announcements/${id}`, {
        method: 'DELETE',
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const getUnreadCount = () => {
    return announcements.filter(a => !a.user_read_at).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DynamicPageTitle pageName="Announcements" />

        {/* Hero Section */}
        <HeroSection
          title={t('Announcements')}
          subtitle={t('Stay updated with latest company news')}
          description={t('View and manage company-wide announcements and important updates')}
          icon="lucide:megaphone"
          illustration="task"
          actions={
            hasPermission('announcements.create')
              ? [
                  {
                    label: t('Create Announcement'),
                    icon: 'lucide:plus',
                    onPress: onCreateOpen,
                    color: 'primary',
                  },
                ]
              : []
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: t('Total'),
              value: announcements.length,
              icon: 'lucide:megaphone',
              color: 'primary',
            },
            {
              title: t('Unread'),
              value: getUnreadCount(),
              icon: 'lucide:mail',
              color: 'warning',
            },
            {
              title: t('Urgent'),
              value: announcements.filter(a => a.priority === 'urgent').length,
              icon: 'lucide:alert-octagon',
              color: 'danger',
            },
            {
              title: t('This Week'),
              value: announcements.filter(a => {
                const date = new Date(a.published_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length,
              icon: 'lucide:calendar',
              color: 'success',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-default-500">{stat.title}</p>
                      <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-full`}>
                      <Icon icon={stat.icon} className={`text-xl text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Select
                label={t('Priority')}
                placeholder={t('All Priorities')}
                className="max-w-xs"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <SelectItem key="low" value="low">{t('Low')}</SelectItem>
                <SelectItem key="medium" value="medium">{t('Medium')}</SelectItem>
                <SelectItem key="high" value="high">{t('High')}</SelectItem>
                <SelectItem key="urgent" value="urgent">{t('Urgent')}</SelectItem>
              </Select>

              <Select
                label={t('Category')}
                placeholder={t('All Categories')}
                className="max-w-xs"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <SelectItem key="general" value="general">{t('General')}</SelectItem>
                <SelectItem key="hr" value="hr">{t('HR')}</SelectItem>
                <SelectItem key="finance" value="finance">{t('Finance')}</SelectItem>
                <SelectItem key="it" value="it">{t('IT')}</SelectItem>
                <SelectItem key="operations" value="operations">{t('Operations')}</SelectItem>
              </Select>

              {(filterPriority || filterCategory) && (
                <Button
                  variant="flat"
                  onPress={() => {
                    setFilterPriority('');
                    setFilterCategory('');
                  }}
                >
                  {t('Clear Filters')}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardBody className="text-center py-12">
                <Icon icon="lucide:inbox" className="text-6xl text-default-300 mx-auto mb-4" />
                <p className="text-default-500">{t('No announcements found')}</p>
              </CardBody>
            </Card>
          ) : (
            announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`${!announcement.user_read_at ? 'border-2 border-primary' : ''}`}>
                  <CardHeader className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Chip
                          color={priorityColors[announcement.priority]}
                          variant="flat"
                          size="sm"
                          startContent={<Icon icon={priorityIcons[announcement.priority]} className="w-3 h-3" />}
                        >
                          {announcement.priority.toUpperCase()}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {announcement.category}
                        </Chip>
                        {!announcement.user_read_at && (
                          <Badge content={t('New')} color="primary" size="sm" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-default-500 mt-1">
                        <Icon icon="lucide:user" className="inline w-4 h-4 mr-1" />
                        {announcement.published_by_name} • {formatDate(announcement.published_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleView(announcement)}
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </Button>
                      {hasPermission('announcements.delete') && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => handleDelete(announcement.id)}
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-default-600 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-default-500">
                      <span className="flex items-center gap-1">
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                        {announcement.total_reads} {t('reads')}
                      </span>
                      {announcement.expires_at && (
                        <span className="flex items-center gap-1">
                          <Icon icon="lucide:clock" className="w-4 h-4" />
                          {t('Expires')}: {formatDate(announcement.expires_at)}
                        </span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
          <ModalContent>
            <ModalHeader>{t('Create Announcement')}</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label={t('Title')}
                  placeholder={t('Enter announcement title')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  label={t('Content')}
                  placeholder={t('Enter announcement content')}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  minRows={4}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label={t('Priority')}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <SelectItem key="low" value="low">{t('Low')}</SelectItem>
                    <SelectItem key="medium" value="medium">{t('Medium')}</SelectItem>
                    <SelectItem key="high" value="high">{t('High')}</SelectItem>
                    <SelectItem key="urgent" value="urgent">{t('Urgent')}</SelectItem>
                  </Select>
                  <Select
                    label={t('Category')}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <SelectItem key="general" value="general">{t('General')}</SelectItem>
                    <SelectItem key="hr" value="hr">{t('HR')}</SelectItem>
                    <SelectItem key="finance" value="finance">{t('Finance')}</SelectItem>
                    <SelectItem key="it" value="it">{t('IT')}</SelectItem>
                    <SelectItem key="operations" value="operations">{t('Operations')}</SelectItem>
                  </Select>
                </div>
                <Input
                  type="datetime-local"
                  label={t('Expires At (Optional)')}
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateClose}>
                {t('Cancel')}
              </Button>
              <Button color="primary" onPress={handleCreate}>
                {t('Create')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
          <ModalContent>
            {selectedAnnouncement && (
              <>
                <ModalHeader>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Chip
                        color={priorityColors[selectedAnnouncement.priority]}
                        variant="flat"
                        size="sm"
                      >
                        {selectedAnnouncement.priority.toUpperCase()}
                      </Chip>
                      <Chip size="sm" variant="flat">
                        {selectedAnnouncement.category}
                      </Chip>
                    </div>
                    <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-default-500">
                      <Icon icon="lucide:user" className="w-4 h-4" />
                      {selectedAnnouncement.published_by_name}
                      <Divider orientation="vertical" />
                      <Icon icon="lucide:calendar" className="w-4 h-4" />
                      {formatDate(selectedAnnouncement.published_at)}
                    </div>
                    <Divider />
                    <div className="prose dark:prose-invert max-w-none">
                      {selectedAnnouncement.content}
                    </div>
                    {selectedAnnouncement.expires_at && (
                      <div className="bg-warning-50 dark:bg-warning-900/20 p-3 rounded-lg">
                        <p className="text-sm text-warning-600 dark:text-warning-400 flex items-center gap-2">
                          <Icon icon="lucide:alert-triangle" className="w-4 h-4" />
                          {t('Expires on')} {formatDate(selectedAnnouncement.expires_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button onPress={onViewClose}>{t('Close')}</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
