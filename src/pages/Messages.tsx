import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useMessages, useConversationMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Plus, User, ArrowLeft, Image, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading, startConversation, sendMessage, uploadImage, markAsRead, totalUnread } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, loading: messagesLoading } = useConversationMessages(selectedConversation);

  const selectedConvo = conversations.find(c => c.id === selectedConversation);

  // Handle URL param for starting conversation with specific user
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && user) {
      startConversation(userId).then(convoId => {
        if (convoId) setSelectedConversation(convoId);
      });
    }
  }, [searchParams, user, startConversation]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (selectedConversation) {
      markAsRead(selectedConversation);
    }
  }, [selectedConversation, messages.length, markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedConversation || (!messageInput.trim() && !selectedImage)) return;
    
    setSending(true);
    try {
      let imageUrl: string | undefined;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage) || undefined;
      }
      
      await sendMessage(selectedConversation, messageInput, imageUrl);
      setMessageInput('');
      setSelectedImage(null);
      setImagePreview(null);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return; // Max 5MB
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view messages</h1>
          <p className="text-muted-foreground">You need to be logged in to access direct messages.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          {totalUnread > 0 && (
            <span className="bg-primary text-primary-foreground text-sm px-2 py-1 rounded-full">
              {totalUnread} unread
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          {/* Conversations List */}
          <Card className={cn(
            "lg:col-span-1 flex flex-col",
            selectedConversation && "hidden lg:flex"
          )}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Conversations</h2>
                <NewConversationDialog onStart={async (userId) => {
                  const convoId = await startConversation(userId);
                  if (convoId) setSelectedConversation(convoId);
                }} />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a conversation with someone</p>
                </div>
              ) : (
                conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo.id)}
                    className={cn(
                      "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b",
                      selectedConversation === convo.id && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={convo.participants[0]?.avatar_url || undefined} />
                      <AvatarFallback>
                        {convo.participants[0]?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {convo.participants[0]?.display_name || 'User'}
                        </span>
                        {convo.lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(convo.lastMessage.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {convo.lastMessage?.content || 'No messages yet'}
                        </p>
                        {convo.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </Card>

          {/* Messages View */}
          <Card className={cn(
            "lg:col-span-2 flex flex-col",
            !selectedConversation && "hidden lg:flex"
          )}>
            {selectedConversation && selectedConvo ? (
              <>
                <div className="p-4 border-b flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedConvo.participants[0]?.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedConvo.participants[0]?.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {selectedConvo.participants[0]?.display_name || 'User'}
                  </span>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet</p>
                      <p className="text-sm">Send the first message!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.sender_id === user.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isOwn ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-4 py-2",
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}
                            >
                              {msg.image_url && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <img
                                      src={msg.image_url}
                                      alt="Shared image"
                                      className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity mb-2"
                                    />
                                  </DialogTrigger>
                                  <DialogContent className="max-w-3xl p-0">
                                    <img
                                      src={msg.image_url}
                                      alt="Shared image"
                                      className="w-full h-auto rounded-lg"
                                    />
                                  </DialogContent>
                                </Dialog>
                              )}
                              {msg.content && <p className="break-words">{msg.content}</p>}
                              <p className={cn(
                                "text-xs mt-1",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}>
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t space-y-3">
                  {imagePreview && (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Selected"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={removeSelectedImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                    >
                      <Image className="h-5 w-5" />
                    </Button>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={(!messageInput.trim() && !selectedImage) || sending}
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a conversation</p>
                  <p className="text-sm">or start a new one</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function NewConversationDialog({ onStart }: { onStart: (userId: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Array<{ user_id: string; display_name: string | null; avatar_url: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .ilike('display_name', `%${query}%`)
        .neq('user_id', user?.id || '')
        .limit(10);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name..."
          />
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {loading ? (
              <p className="text-center text-muted-foreground py-4">Searching...</p>
            ) : users.length === 0 && search.length >= 2 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              users.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => {
                    onStart(u.user_id);
                    setOpen(false);
                    setSearch('');
                    setUsers([]);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.display_name || 'User'}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
