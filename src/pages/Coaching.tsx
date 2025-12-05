import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCoaching } from '@/hooks/useCoaching';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CoachingChat from '@/components/coaching/CoachingChat';
import ConversationSidebar from '@/components/coaching/ConversationSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Coaching = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, subscription } = useAuth();
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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">AI Coaching</h1>
          <p className="text-muted-foreground">
            Your personal coach for training, nutrition, and mindset
          </p>
        </div>
        
        <Card className="h-[calc(100vh-220px)] overflow-hidden">
          <div className="flex h-full">
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
