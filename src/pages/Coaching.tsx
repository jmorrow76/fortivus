import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCoaching } from '@/hooks/useCoaching';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoachingChat from '@/components/coaching/CoachingChat';
import ConversationSidebar from '@/components/coaching/ConversationSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Loader2, Lock, Crown, Menu, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Coaching = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscription } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    setCurrentConversation,
    setMessages,
  } = useCoaching();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && subscription.subscribed) {
      fetchConversations();
    }
  }, [user, subscription.subscribed, fetchConversations]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Elite Feature</h1>
            <p className="text-muted-foreground mb-6">
              1-on-1 AI Coaching is available exclusively for Elite members. 
              Get personalized guidance on training, nutrition, and mindset from your AI coach.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Crown className="w-4 h-4 text-primary" />
                <span>Unlimited coaching conversations</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Crown className="w-4 h-4 text-primary" />
                <span>Personalized advice for men 40+</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Crown className="w-4 h-4 text-primary" />
                <span>Conversation history saved</span>
              </div>
            </div>
            <Button asChild className="mt-8">
              <Link to="/pricing">Upgrade to Elite</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setMobileMenuOpen(false);
  };

  const handleSelectConversation = (conversation: typeof currentConversation) => {
    if (conversation) {
      selectConversation(conversation);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 md:py-6">
        {/* Desktop header */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight">AI Coaching</h1>
          <p className="text-muted-foreground">
            Your personal coach for training, nutrition, and mindset
          </p>
        </div>

        {/* Mobile header with menu */}
        <div className="mb-4 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI Coaching</h1>
              <p className="text-sm text-muted-foreground">
                {currentConversation?.title || 'New conversation'}
              </p>
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="h-full">
                  <ConversationSidebar
                    conversations={conversations}
                    currentConversation={currentConversation}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={deleteConversation}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        <Card className="h-[calc(100vh-200px)] md:h-[calc(100vh-220px)] overflow-hidden">
          <div className="flex h-full">
            {/* Desktop sidebar */}
            <div className="w-64 shrink-0 hidden md:block">
              <ConversationSidebar
                conversations={conversations}
                currentConversation={currentConversation}
                onSelectConversation={selectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={deleteConversation}
              />
            </div>
            <div className="flex-1">
              <CoachingChat
                messages={messages}
                isStreaming={isStreaming}
                onSendMessage={sendMessage}
              />
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Coaching;
