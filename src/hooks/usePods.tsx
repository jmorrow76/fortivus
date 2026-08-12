import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PodMember {
  id: string;
  pod_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export interface Pod {
  id: string;
  name: string;
  commitment: string;
  focus: string | null;
  meeting_rhythm: string;
  max_members: number;
  created_by: string;
  is_active: boolean;
  created_at: string;
  members: PodMember[];
}

export interface PodCheckin {
  id: string;
  pod_id: string;
  user_id: string;
  checkin_date: string;
  kept_commitment: boolean;
  note: string | null;
  prayer_request: string | null;
  created_at: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);

export const usePods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pods, setPods] = useState<Pod[]>([]);
  const [myPods, setMyPods] = useState<Pod[]>([]);
  const [checkins, setCheckins] = useState<Record<string, PodCheckin[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: podRows } = await supabase
        .from('pods')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: myMemberships } = await supabase
        .from('pod_members')
        .select('pod_id')
        .eq('user_id', user.id);

      const myPodIds = new Set((myMemberships || []).map((m) => m.pod_id));

      const { data: memberRows } = await supabase
        .from('pod_members')
        .select('*')
        .in('pod_id', (podRows || []).map((p) => p.id).concat('00000000-0000-0000-0000-000000000000'));

      const memberUserIds = Array.from(new Set((memberRows || []).map((m) => m.user_id)));
      let profiles: { user_id: string; display_name: string | null; avatar_url: string | null }[] = [];
      if (memberUserIds.length > 0) {
        const { data } = await supabase.rpc('get_public_profiles', { user_ids: memberUserIds });
        profiles = data || [];
      }

      const enriched: Pod[] = (podRows || []).map((p) => ({
        ...p,
        members: (memberRows || [])
          .filter((m) => m.pod_id === p.id)
          .map((m) => {
            const prof = profiles.find((pr) => pr.user_id === m.user_id);
            return { ...m, display_name: prof?.display_name, avatar_url: prof?.avatar_url };
          }),
      }));

      setPods(enriched);
      setMyPods(enriched.filter((p) => myPodIds.has(p.id)));
    } catch (error) {
      console.error('Error loading pods:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createPod = async (data: {
    name: string;
    commitment: string;
    focus: string;
    meeting_rhythm: string;
    max_members: number;
  }) => {
    if (!user) return;
    const { data: pod, error } = await supabase
      .from('pods')
      .insert({ ...data, created_by: user.id })
      .select()
      .single();

    if (error || !pod) {
      toast({ title: 'Error', description: 'Could not create the pod', variant: 'destructive' });
      return;
    }

    await supabase.from('pod_members').insert({ pod_id: pod.id, user_id: user.id, role: 'leader' });
    toast({ title: 'Pod created', description: 'Invite brothers to fill your pod.' });
    fetchData();
  };

  const joinPod = async (podId: string) => {
    if (!user) return;
    const { error } = await supabase.from('pod_members').insert({ pod_id: podId, user_id: user.id });
    if (error) {
      toast({
        title: 'Could not join',
        description: error.code === '23505' ? "You're already in this pod" : 'This pod may be full',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Welcome to the pod', description: 'Check in daily and keep your word.' });
      fetchData();
    }
  };

  const leavePod = async (podId: string) => {
    if (!user) return;
    const { error } = await supabase.from('pod_members').delete().eq('pod_id', podId).eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Could not leave the pod', variant: 'destructive' });
    } else {
      toast({ title: 'You left the pod' });
      fetchData();
    }
  };

  const fetchCheckins = useCallback(async (podId: string) => {
    const { data } = await supabase
      .from('pod_checkins')
      .select('*')
      .eq('pod_id', podId)
      .order('checkin_date', { ascending: false })
      .limit(60);

    const userIds = Array.from(new Set((data || []).map((c) => c.user_id)));
    let profiles: { user_id: string; display_name: string | null; avatar_url: string | null }[] = [];
    if (userIds.length > 0) {
      const { data: profs } = await supabase.rpc('get_public_profiles', { user_ids: userIds });
      profiles = profs || [];
    }

    setCheckins((prev) => ({
      ...prev,
      [podId]: (data || []).map((c) => {
        const prof = profiles.find((p) => p.user_id === c.user_id);
        return { ...c, display_name: prof?.display_name, avatar_url: prof?.avatar_url };
      }),
    }));
  }, []);

  const submitCheckin = async (
    podId: string,
    data: { kept_commitment: boolean; note: string; prayer_request: string }
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from('pod_checkins')
      .upsert(
        { pod_id: podId, user_id: user.id, checkin_date: today(), ...data },
        { onConflict: 'pod_id,user_id,checkin_date' }
      );

    if (error) {
      toast({ title: 'Error', description: 'Check-in failed', variant: 'destructive' });
    } else {
      toast({ title: 'Checked in 🙏', description: 'Your brothers can see your update.' });
      fetchCheckins(podId);
    }
  };

  const streakFor = (podId: string, userId: string) => {
    const rows = (checkins[podId] || [])
      .filter((c) => c.user_id === userId && c.kept_commitment)
      .map((c) => c.checkin_date)
      .sort()
      .reverse();
    if (rows.length === 0) return 0;
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (rows.includes(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (streak === 0 && key === today()) {
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return {
    pods,
    myPods,
    checkins,
    loading,
    createPod,
    joinPod,
    leavePod,
    fetchCheckins,
    submitCheckin,
    streakFor,
    today: today(),
    refetch: fetchData,
  };
};
