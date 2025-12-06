import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: Profile[];
  lastMessage?: Message;
  unreadCount: number;
}

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      // Get all conversations the user is part of
      const { data: participations, error: partError } = await supabase
        .from('dm_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (partError) throw partError;

      if (!participations?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participations.map(p => p.conversation_id);

      // Get conversation details
      const { data: convos, error: convoError } = await supabase
        .from('dm_conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convoError) throw convoError;

      // Get all participants for these conversations
      const { data: allParticipants, error: allPartError } = await supabase
        .from('dm_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', conversationIds);

      if (allPartError) throw allPartError;

      // Get unique user IDs (excluding current user)
      const otherUserIds = [...new Set(
        allParticipants
          ?.filter(p => p.user_id !== user.id)
          .map(p => p.user_id) || []
      )];

      // Fetch profiles
      let profiles: Profile[] = [];
      if (otherUserIds.length > 0) {
        const { data: profileData } = await supabase
          .rpc('get_public_profiles', { user_ids: otherUserIds });
        profiles = profileData || [];
      }

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (convos || []).map(async (convo) => {
          // Get last message
          const { data: messages } = await supabase
            .from('dm_messages')
            .select('*')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Get unread count
          const { count } = await supabase
            .from('dm_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);

          // Get participants for this conversation
          const convoParticipants = allParticipants
            ?.filter(p => p.conversation_id === convo.id && p.user_id !== user.id)
            .map(p => profiles.find(pr => pr.user_id === p.user_id))
            .filter(Boolean) as Profile[];

          return {
            ...convo,
            participants: convoParticipants,
            lastMessage: messages?.[0],
            unreadCount: count || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dm-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists between these users
      const { data: myParticipations } = await supabase
        .from('dm_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (myParticipations?.length) {
        const { data: existingConvo } = await supabase
          .from('dm_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', myParticipations.map(p => p.conversation_id));

        if (existingConvo?.length) {
          return existingConvo[0].conversation_id;
        }
      }

      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from('dm_conversations')
        .insert({})
        .select()
        .single();

      if (convoError) throw convoError;

      // Add both participants
      const { error: partError } = await supabase
        .from('dm_participants')
        .insert([
          { conversation_id: newConvo.id, user_id: user.id },
          { conversation_id: newConvo.id, user_id: otherUserId },
        ]);

      if (partError) throw partError;

      await fetchConversations();
      return newConvo.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('dm_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('dm_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      await supabase
        .from('dm_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    loading,
    startConversation,
    sendMessage,
    markAsRead,
    refetch: fetchConversations,
    totalUnread,
  };
}

export function useConversationMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return { messages, loading, refetch: fetchMessages };
}
