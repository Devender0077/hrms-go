import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardBody, 
  Avatar, 
  Input, 
  Button, 
  Spinner, 
  Chip, 
  ScrollShadow,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicPageTitle from '../components/common/DynamicPageTitle';
import HeroSection from '../components/common/HeroSection';
import { useAuth } from '../contexts/auth-context';
import { usePusher } from '../contexts/pusher-context';
import { useSettings } from '../contexts/settings-context';
import { useTranslation } from '../contexts/translation-context';
import { apiRequest } from '../services/api-service';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo: string | null;
  status: string;
  role_name: string;
  department_name: string;
}

interface Conversation {
  user_id: number;
  user_name: string;
  user_photo: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  group_type: string;
  member_count: number;
  unread_count: number;
  user_role: string;
  created_by_name: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id?: number;
  group_id?: number;
  message: string;
  message_type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_name: string;
  sender_photo: string | null;
}

export default function Messenger() {
  const { user } = useAuth();
  const { pusher, isConnected } = usePusher();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('direct');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    group_type: 'custom',
    member_ids: [] as number[]
  });

  // Check if messenger is enabled
  const messengerEnabled = settings.general?.messengerEnabled ?? true;

  // Load conversations
  const loadConversations = async () => {
    try {
      const response = await apiRequest<{ data: Conversation[] }>('/messenger/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load groups
  const loadGroups = async () => {
    try {
      const response = await apiRequest<{ data: Group[] }>('/messenger/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const response = await apiRequest<{ data: User[] }>('/messenger/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load direct messages
  const loadMessages = async (userId: number) => {
    try {
      const response = await apiRequest<{ data: Message[] }>(`/messenger/messages/${userId}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Load group messages
  const loadGroupMessages = async (groupId: number) => {
    try {
      const response = await apiRequest<{ data: Message[] }>(`/messenger/groups/${groupId}/messages`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading group messages:', error);
    }
  };

  // Send direct message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || (!selectedUser && !selectedGroup) || sending) return;

    setSending(true);
    try {
      if (selectedGroup) {
        // Send to group
        await apiRequest(`/messenger/groups/${selectedGroup.id}/send`, {
          method: 'POST',
          body: JSON.stringify({
            message: newMessage.trim()
          })
        });
        await loadGroupMessages(selectedGroup.id);
        await loadGroups();
      } else if (selectedUser) {
        // Send to user
        await apiRequest('/messenger/send', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: selectedUser.id,
            message: newMessage.trim(),
            message_type: 'direct'
          })
        });
        await loadMessages(selectedUser.id);
        await loadConversations();
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      addToast({
        title: 'Send Failed',
        description: 'Failed to send message. Please try again.',
        type: 'error',
        duration: 5000
      });
    } finally {
      setSending(false);
    }
  };

  // Create group
  const handleCreateGroup = async () => {
    if (!groupForm.name) {
      addToast({
        title: 'Validation Error',
        description: 'Group name is required',
        type: 'error',
        duration: 3000
      });
      return;
    }

    try {
      await apiRequest('/messenger/groups', {
        method: 'POST',
        body: JSON.stringify(groupForm)
      });
      
      addToast({
        title: 'Group Created',
        description: 'Message group created successfully',
        type: 'success',
        duration: 3000
      });
      
      onClose();
      loadGroups();
      setGroupForm({
        name: '',
        description: '',
        group_type: 'custom',
        member_ids: []
      });
    } catch (error) {
      console.error('Error creating group:', error);
      addToast({
        title: 'Create Failed',
        description: 'Failed to create group. Please try again.',
        type: 'error',
        duration: 5000
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for new messages via Pusher
  useEffect(() => {
    if (!pusher || !user?.id) return;

    const channel = pusher.subscribe(`user-${user.id}`);
    
    channel.bind('new-message', (data: any) => {
      console.log('📬 New message received:', data);
      
      if (selectedUser && data.sender_id === selectedUser.id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
      
      loadConversations();
    });

    channel.bind('new-group-message', (data: any) => {
      console.log('📬 New group message received:', data);
      
      if (selectedGroup && data.group_id === selectedGroup.id) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
      
      loadGroups();
    });

    return () => {
      channel.unbind('new-message');
      channel.unbind('new-group-message');
    };
  }, [pusher, user?.id, selectedUser, selectedGroup]);

  // Initial load
  useEffect(() => {
    loadConversations();
    loadGroups();
    loadUsers();
  }, []);

  // Load messages when user/group selected
  useEffect(() => {
    if (selectedUser) {
      setSelectedGroup(null);
      loadMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedGroup) {
      setSelectedUser(null);
      loadGroupMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter users by search
  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Filter groups by search
  const filteredGroups = groups.filter(g =>
    (g.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (g.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Get group type color
  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'team_lead': return 'primary';
      case 'management': return 'secondary';
      case 'accounts': return 'success';
      case 'hr': return 'warning';
      case 'department': return 'danger';
      default: return 'default';
    }
  };

  if (!messengerEnabled) {
    return (
      <div className="space-y-6">
        <DynamicPageTitle title="Messenger" />
        <Card>
          <CardBody className="p-12 text-center">
            <Icon icon="lucide:message-circle-off" className="text-6xl text-default-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Messenger Disabled</h3>
            <p className="text-default-500 mb-4">
              The messenger feature has been disabled by your administrator.
            </p>
            <p className="text-sm text-default-400">
              Contact your HR or system administrator to enable this feature.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DynamicPageTitle title="Messenger" />
      
      <HeroSection
        title="Messenger"
        subtitle="Real-time messaging with your team"
        icon="lucide:message-circle"
        actions={
          <div className="flex items-center gap-2">
            {isConnected && (
              <Chip color="success" variant="flat" size="sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  Live
                </div>
              </Chip>
            )}
            <Button
              color="primary"
              startContent={<Icon icon="lucide:users" />}
              onPress={onOpen}
              size="sm"
            >
              Create Group
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Conversations/Groups List */}
        <Card className="col-span-12 md:col-span-4 lg:col-span-3">
          <CardBody className="p-0">
            <div className="p-4 border-b border-divider space-y-3">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                size="sm"
              />
              
              <Tabs 
                selectedKey={activeTab} 
                onSelectionChange={(key) => setActiveTab(key as string)}
                fullWidth
                size="sm"
              >
                <Tab key="direct" title="Direct" />
                <Tab key="groups" title="Groups" />
              </Tabs>
            </div>

            <ScrollShadow className="h-[calc(100vh-420px)]">
              <div className="divide-y divide-divider">
                {activeTab === 'direct' ? (
                  // Direct Messages List
                  <>
                    {filteredUsers.map((u) => {
                      const conversation = conversations.find(c => c.user_id === u.id);
                      const isSelected = selectedUser?.id === u.id;

                      return (
                        <motion.div
                          key={u.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                          onClick={() => setSelectedUser(u)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar
                                src={u.profile_photo || undefined}
                                name={u.name}
                                size="md"
                                className="flex-shrink-0"
                              />
                              {u.status === 'active' && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white dark:border-gray-900 rounded-full" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm truncate">{u.name}</h4>
                                {conversation && (
                                  <span className="text-xs text-default-400">
                                    {formatTime(conversation.last_message_time)}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-default-500 truncate">
                                {u.role_name} {u.department_name && `• ${u.department_name}`}
                              </p>
                              {conversation && conversation.last_message && (
                                <p className="text-xs text-default-400 truncate mt-1">
                                  {conversation.last_message}
                                </p>
                              )}
                              {conversation && conversation.unread_count > 0 && (
                                <Chip color="primary" size="sm" className="mt-1">
                                  {conversation.unread_count} new
                                </Chip>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <div className="p-8 text-center text-default-400">
                        <Icon icon="lucide:users" className="text-4xl mx-auto mb-2" />
                        <p>No users found</p>
                      </div>
                    )}
                  </>
                ) : (
                  // Groups List
                  <>
                    {filteredGroups.map((g) => {
                      const isSelected = selectedGroup?.id === g.id;

                      return (
                        <motion.div
                          key={g.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          className={`p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                          onClick={() => setSelectedGroup(g)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                              <Icon icon="lucide:users" className="text-white text-xl" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm truncate">{g.name}</h4>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Chip 
                                  color={getGroupTypeColor(g.group_type) as any} 
                                  variant="flat" 
                                  size="sm"
                                >
                                  {g.group_type.replace('_', ' ')}
                                </Chip>
                                <span className="text-xs text-default-500">
                                  {g.member_count} members
                                </span>
                              </div>
                              {g.description && (
                                <p className="text-xs text-default-400 truncate">
                                  {g.description}
                                </p>
                              )}
                              {g.unread_count > 0 && (
                                <Chip color="primary" size="sm" className="mt-1">
                                  {g.unread_count} new
                                </Chip>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {filteredGroups.length === 0 && (
                      <div className="p-8 text-center text-default-400">
                        <Icon icon="lucide:users" className="text-4xl mx-auto mb-2" />
                        <p>No groups found</p>
                        <Button
                          color="primary"
                          variant="flat"
                          size="sm"
                          className="mt-4"
                          onPress={onOpen}
                          startContent={<Icon icon="lucide:plus" />}
                        >
                          Create Group
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollShadow>
          </CardBody>
        </Card>

        {/* Messages Area */}
        <Card className="col-span-12 md:col-span-8 lg:col-span-9">
          <CardBody className="p-0 flex flex-col h-full">
            {(selectedUser || selectedGroup) ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-divider flex items-center gap-3">
                  {selectedGroup ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <Icon icon="lucide:users" className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedGroup.name}</h3>
                        <p className="text-sm text-default-500">
                          {selectedGroup.member_count} members • {selectedGroup.group_type.replace('_', ' ')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar
                        src={selectedUser?.profile_photo || undefined}
                        name={selectedUser?.name}
                        size="md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedUser?.name}</h3>
                        <p className="text-sm text-default-500">
                          {selectedUser?.role_name} {selectedUser?.department_name && `• ${selectedUser.department_name}`}
                        </p>
                      </div>
                    </>
                  )}
                  {isConnected && (
                    <Chip color="success" variant="flat" size="sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                        Online
                      </div>
                    </Chip>
                  )}
                </div>

                {/* Messages */}
                <ScrollShadow className="flex-1 p-4 space-y-4 h-[calc(100vh-480px)]">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isSender = msg.sender_id === user?.id;
                      const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {showAvatar ? (
                            <Avatar
                              src={msg.sender_photo || undefined}
                              name={msg.sender_name}
                              size="sm"
                              className="flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8" />
                          )}

                          <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {showAvatar && !isSender && (
                              <span className="text-xs text-default-500 mb-1">{msg.sender_name}</span>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isSender
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-default-100 dark:bg-default-50 text-foreground'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                            <span className="text-xs text-default-400 mt-1">
                              {formatTime(msg.created_at)}
                              {isSender && msg.is_read && !selectedGroup && (
                                <Icon icon="lucide:check-check" className="inline ml-1 text-primary-500" />
                              )}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />

                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-default-400">
                      <Icon icon="lucide:message-circle" className="text-6xl mb-4" />
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  )}
                </ScrollShadow>

                {/* Message Input */}
                <div className="p-4 border-t border-divider">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      size="lg"
                      classNames={{
                        input: 'text-sm',
                        inputWrapper: 'bg-default-100 dark:bg-default-50'
                      }}
                    />
                    <Button
                      color="primary"
                      isIconOnly
                      size="lg"
                      onPress={handleSendMessage}
                      isLoading={sending}
                      isDisabled={!newMessage.trim()}
                    >
                      <Icon icon="lucide:send" className="text-xl" />
                    </Button>
                  </div>
                  <p className="text-xs text-default-400 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-default-400">
                <Icon icon="lucide:message-square" className="text-6xl mb-4" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a user or group from the list to start messaging</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Create Group Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            Create Message Group
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Group Name"
                placeholder="Enter group name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                isRequired
                startContent={<Icon icon="lucide:tag" className="text-default-400" />}
              />

              <Textarea
                label="Description"
                placeholder="Enter group description (optional)"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                rows={3}
              />

              <Select
                label="Group Type"
                placeholder="Select group type"
                selectedKeys={[groupForm.group_type]}
                onChange={(e) => setGroupForm({ ...groupForm, group_type: e.target.value })}
                startContent={<Icon icon="lucide:folder" className="text-default-400" />}
              >
                <SelectItem key="team_lead" value="team_lead">
                  Team Lead
                </SelectItem>
                <SelectItem key="management" value="management">
                  Management
                </SelectItem>
                <SelectItem key="accounts" value="accounts">
                  Accounts
                </SelectItem>
                <SelectItem key="hr" value="hr">
                  HR
                </SelectItem>
                <SelectItem key="department" value="department">
                  Department
                </SelectItem>
                <SelectItem key="custom" value="custom">
                  Custom
                </SelectItem>
              </Select>

              <div>
                <label className="block text-sm font-medium mb-2">Select Members</label>
                <div className="border border-divider rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 p-2 hover:bg-default-100 dark:hover:bg-default-50 rounded-lg cursor-pointer"
                      onClick={() => {
                        const isSelected = groupForm.member_ids.includes(u.id);
                        setGroupForm({
                          ...groupForm,
                          member_ids: isSelected
                            ? groupForm.member_ids.filter(id => id !== u.id)
                            : [...groupForm.member_ids, u.id]
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={groupForm.member_ids.includes(u.id)}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                      <Avatar
                        src={u.profile_photo || undefined}
                        name={u.name}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-default-500">
                          {u.role_name} {u.department_name && `• ${u.department_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-default-500 mt-2">
                  {groupForm.member_ids.length} member(s) selected
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleCreateGroup}
              isDisabled={!groupForm.name || groupForm.member_ids.length === 0}
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}