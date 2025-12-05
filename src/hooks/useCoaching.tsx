import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useCoaching = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    const { data, error } = await supabase
      .from('coaching_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return;
    }
    setConversations(data || []);
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from('coaching_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    setMessages((data || []).map(m => ({
      ...m,
      role: m.role as 'user' | 'assistant'
    })));
  }, []);

  const createConversation = useCallback(async (initialTitle: string = 'New Conversation') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('coaching_conversations')
      .insert({ user_id: user.id, title: initialTitle })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast({ title: 'Error', description: 'Failed to create conversation', variant: 'destructive' });
      return null;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data);
    setMessages([]);
    return data;
  }, [toast]);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  }, [fetchMessages]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('coaching_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      toast({ title: 'Error', description: 'Failed to delete conversation', variant: 'destructive' });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [currentConversation, toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    let conversation = currentConversation;
    
    // Create new conversation if none exists
    if (!conversation) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      conversation = await createConversation(title);
      if (!conversation) return;
    }

    // Add user message to DB and state
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    await supabase.from('coaching_messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content,
    });

    // Update conversation title if first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('coaching_conversations')
        .update({ title })
        .eq('id', conversation.id);
      
      setConversations(prev => 
        prev.map(c => c.id === conversation!.id ? { ...c, title } : c)
      );
    }

    // Stream AI response
    setIsStreaming(true);
    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    }]);

    try {
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coaching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;

          try {
            const parsed = JSON.parse(line.slice(6));
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => 
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            // Incomplete JSON, will be handled in next iteration
          }
        }
      }

      // Save assistant message to DB
      if (assistantContent) {
        await supabase.from('coaching_messages').insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: assistantContent,
        });

        // Update conversation timestamp
        await supabase
          .from('coaching_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversation.id);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get coaching response',
        variant: 'destructive',
      });
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  }, [currentConversation, messages, isStreaming, createConversation, toast]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isStreaming,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    setCurrentConversation,
    setMessages,
  };
};
