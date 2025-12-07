import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  itemCount?: number;
}

interface PlaylistItem {
  id: string;
  playlist_id: string;
  video_id: string;
  sort_order: number;
}

export const useExerciseFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setFavorites([]);
      setPlaylists([]);
      setPlaylistItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [favRes, playlistRes, itemsRes] = await Promise.all([
        supabase
          .from('exercise_favorites')
          .select('video_id')
          .eq('user_id', user.id),
        supabase
          .from('exercise_playlists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('exercise_playlist_items')
          .select('*')
          .order('sort_order', { ascending: true })
      ]);

      if (favRes.data) {
        setFavorites(favRes.data.map(f => f.video_id));
      }
      
      if (playlistRes.data) {
        // Calculate item counts for each playlist
        const playlistsWithCounts = playlistRes.data.map(p => ({
          ...p,
          itemCount: itemsRes.data?.filter(i => i.playlist_id === p.id).length || 0
        }));
        setPlaylists(playlistsWithCounts);
      }
      
      if (itemsRes.data) {
        setPlaylistItems(itemsRes.data);
      }
    } catch (error) {
      console.error('Error fetching exercise favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (videoId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    const isFavorited = favorites.includes(videoId);
    
    if (isFavorited) {
      // Remove favorite
      const { error } = await supabase
        .from('exercise_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId);

      if (error) {
        toast.error('Failed to remove favorite');
        return;
      }
      
      setFavorites(prev => prev.filter(id => id !== videoId));
      toast.success('Removed from favorites');
    } else {
      // Add favorite
      const { error } = await supabase
        .from('exercise_favorites')
        .insert({ user_id: user.id, video_id: videoId });

      if (error) {
        toast.error('Failed to add favorite');
        return;
      }
      
      setFavorites(prev => [...prev, videoId]);
      toast.success('Added to favorites');
    }
  };

  const createPlaylist = async (name: string, description?: string) => {
    if (!user) {
      toast.error('Please sign in to create playlists');
      return null;
    }

    const { data, error } = await supabase
      .from('exercise_playlists')
      .insert({ user_id: user.id, name, description })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create playlist');
      return null;
    }

    setPlaylists(prev => [{ ...data, itemCount: 0 }, ...prev]);
    toast.success('Playlist created');
    return data;
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('exercise_playlists')
      .delete()
      .eq('id', playlistId);

    if (error) {
      toast.error('Failed to delete playlist');
      return;
    }

    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    setPlaylistItems(prev => prev.filter(i => i.playlist_id !== playlistId));
    toast.success('Playlist deleted');
  };

  const addToPlaylist = async (playlistId: string, videoId: string) => {
    if (!user) {
      toast.error('Please sign in to add to playlists');
      return;
    }

    // Check if already in playlist
    const exists = playlistItems.some(i => i.playlist_id === playlistId && i.video_id === videoId);
    if (exists) {
      toast.info('Exercise already in playlist');
      return;
    }

    const sortOrder = playlistItems.filter(i => i.playlist_id === playlistId).length;

    const { data, error } = await supabase
      .from('exercise_playlist_items')
      .insert({ playlist_id: playlistId, video_id: videoId, sort_order: sortOrder })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add to playlist');
      return;
    }

    setPlaylistItems(prev => [...prev, data]);
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, itemCount: (p.itemCount || 0) + 1 } : p
    ));
    toast.success('Added to playlist');
  };

  const removeFromPlaylist = async (playlistId: string, videoId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('exercise_playlist_items')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('video_id', videoId);

    if (error) {
      toast.error('Failed to remove from playlist');
      return;
    }

    setPlaylistItems(prev => prev.filter(i => !(i.playlist_id === playlistId && i.video_id === videoId)));
    setPlaylists(prev => prev.map(p => 
      p.id === playlistId ? { ...p, itemCount: Math.max(0, (p.itemCount || 1) - 1) } : p
    ));
    toast.success('Removed from playlist');
  };

  const getPlaylistVideos = (playlistId: string) => {
    return playlistItems
      .filter(i => i.playlist_id === playlistId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(i => i.video_id);
  };

  const isFavorited = (videoId: string) => favorites.includes(videoId);

  const isInPlaylist = (playlistId: string, videoId: string) => 
    playlistItems.some(i => i.playlist_id === playlistId && i.video_id === videoId);

  return {
    favorites,
    playlists,
    playlistItems,
    loading,
    toggleFavorite,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    getPlaylistVideos,
    isFavorited,
    isInPlaylist,
    refetch: fetchData
  };
};
