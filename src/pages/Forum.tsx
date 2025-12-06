import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLikes } from "@/hooks/useLikes";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LikeButton } from "@/components/LikeButton";
import { PrayerButton } from "@/components/PrayerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MessageSquare,
  Dumbbell,
  Apple,
  Heart,
  Trophy,
  Plus,
  Loader2,
  Clock,
  Eye,
  MessageCircle,
  User,
  Send,
  Pin,
  Lock,
  Image as ImageIcon,
  X,
  HeartHandshake,
  HandHeart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

interface Topic {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  image_url?: string | null;
  post_count?: number;
  author_name?: string;
}

interface Post {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  image_url?: string | null;
  author_name?: string;
}

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Dumbbell,
  Apple,
  Heart,
  Trophy,
  HeartHandshake,
  HandHeart,
};

const Forum = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [topicImage, setTopicImage] = useState<File | null>(null);
  const [topicImagePreview, setTopicImagePreview] = useState<string | null>(null);
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const topicImageRef = useRef<HTMLInputElement>(null);
  const postImageRef = useRef<HTMLInputElement>(null);

  // Like hooks for topics and posts
  const topicIds = useMemo(() => topics.map(t => t.id), [topics]);
  const postIds = useMemo(() => posts.map(p => p.id), [posts]);
  
  const { 
    likeCounts: topicLikeCounts, 
    userLikes: topicUserLikes, 
    toggleLike: toggleTopicLike 
  } = useLikes('forum_topic', topicIds);
  
  const { 
    likeCounts: postLikeCounts, 
    userLikes: postUserLikes, 
    toggleLike: togglePostLike 
  } = useLikes('forum_post', postIds);

  // Prayer hooks for prayer request category topics
  const { 
    likeCounts: topicPrayerCounts, 
    userLikes: topicUserPrayers, 
    toggleLike: toggleTopicPrayer 
  } = useLikes('prayer_request', topicIds);

  // Check if current category is Prayer Requests
  const isPrayerCategory = useMemo(() => {
    const category = categories.find(c => c.id === selectedCategory);
    return category?.name === 'Prayer Requests';
  }, [categories, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchTopics(selectedCategory);
      setSearchParams({ category: selectedCategory });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedTopic) {
      fetchPosts(selectedTopic.id);
    }
  }, [selectedTopic]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (categoryId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("category_id", categoryId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch post counts and author names
      const topicsWithMeta = await Promise.all(
        (data || []).map(async (topic) => {
          const { count } = await supabase
            .from("forum_posts")
            .select("*", { count: "exact", head: true })
            .eq("topic_id", topic.id);

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", topic.user_id)
            .maybeSingle();

          return {
            ...topic,
            post_count: count || 0,
            author_name: profile?.display_name || "Anonymous",
          };
        })
      );

      setTopics(topicsWithMeta);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author names
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", post.user_id)
            .maybeSingle();

          return {
            ...post,
            author_name: profile?.display_name || "Anonymous",
          };
        })
      );

      setPosts(postsWithAuthors);

      // Increment view count
      await supabase
        .from("forum_topics")
        .update({ view_count: (selectedTopic?.view_count || 0) + 1 })
        .eq("id", topicId);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const moderateContent = async (content: string, type: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("moderate-content", {
        body: { content, type },
      });

      if (error) {
        console.error("Moderation error:", error);
        return true; // Allow on error
      }

      if (!data.approved) {
        toast({
          title: "Content not allowed",
          description: data.reason || "Your content was flagged by our moderation system.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Moderation error:", error);
      return true; // Allow on error
    }
  };

  const handleImageSelect = (
    file: File | null,
    setImage: (f: File | null) => void,
    setPreview: (s: string | null) => void
  ) => {
    if (!file) {
      setImage(null);
      setPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("forum-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("forum-images")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!user || !session || !selectedCategory) {
      navigate("/auth");
      return;
    }

    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both a title and content.",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);

    // Moderate content
    const isApproved = await moderateContent(
      `${newTopicTitle}\n\n${newTopicContent}`,
      "topic"
    );

    if (!isApproved) {
      setPosting(false);
      return;
    }

    try {
      // Upload image if present
      let imageUrl: string | null = null;
      if (topicImage) {
        imageUrl = await uploadImage(topicImage, "topics");
        if (!imageUrl && topicImage) {
          setPosting(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          category_id: selectedCategory,
          user_id: user.id,
          title: newTopicTitle.trim(),
          content: newTopicContent.trim(),
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Topic created",
        description: "Your topic has been posted successfully.",
      });

      setNewTopicTitle("");
      setNewTopicContent("");
      setTopicImage(null);
      setTopicImagePreview(null);
      setDialogOpen(false);
      fetchTopics(selectedCategory);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !session || !selectedTopic) {
      navigate("/auth");
      return;
    }

    if (!newPostContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }

    if (selectedTopic.is_locked) {
      toast({
        title: "Topic locked",
        description: "This topic is locked and no longer accepting replies.",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);

    // Moderate content
    const isApproved = await moderateContent(newPostContent, "reply");

    if (!isApproved) {
      setPosting(false);
      return;
    }

    try {
      // Upload image if present
      let imageUrl: string | null = null;
      if (postImage) {
        imageUrl = await uploadImage(postImage, "posts");
        if (!imageUrl && postImage) {
          setPosting(false);
          return;
        }
      }

      const { error } = await supabase.from("forum_posts").insert({
        topic_id: selectedTopic.id,
        user_id: user.id,
        content: newPostContent.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
      });

      setNewPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      fetchPosts(selectedTopic.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const renderCategoryList = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => {
        const IconComponent = iconMap[category.icon] || MessageSquare;
        return (
          <Card
            key={category.id}
            className="cursor-pointer hover:border-accent/50 transition-colors"
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <IconComponent className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{category.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTopicList = () => {
    const category = categories.find((c) => c.id === selectedCategory);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedCategory(null);
              setSearchParams({});
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!user}>
                <Plus className="h-4 w-4 mr-2" />
                {isPrayerCategory ? 'Share Prayer Request' : 'New Topic'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isPrayerCategory ? 'Share a Prayer Request' : 'Create New Topic'}
                </DialogTitle>
                <DialogDescription>
                  {isPrayerCategory 
                    ? 'Share your prayer needs with your brothers in Christ. We\'ll lift you up in prayer.'
                    : `Start a new discussion in ${category?.name}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder={isPrayerCategory ? "Prayer request title" : "Topic title"}
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  maxLength={200}
                />
                <Textarea
                  placeholder={isPrayerCategory ? "Share your prayer request..." : "What's on your mind?"}
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={5}
                  maxLength={5000}
                />
                
                {/* Image Upload */}
                <div>
                  <input
                    type="file"
                    ref={topicImageRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(
                      e.target.files?.[0] || null,
                      setTopicImage,
                      setTopicImagePreview
                    )}
                  />
                  {topicImagePreview ? (
                    <div className="relative">
                      <img
                        src={topicImagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => {
                          setTopicImage(null);
                          setTopicImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => topicImageRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add Photo (optional)
                    </Button>
                  )}
                </div>

                <Button
                  onClick={handleCreateTopic}
                  disabled={posting || uploadingImage}
                  className="w-full"
                >
                  {(posting || uploadingImage) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {uploadingImage ? "Uploading..." : "Post Topic"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <h2 className="font-heading text-2xl font-bold">{category?.name}</h2>

        {topics.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-heading font-semibold text-lg mb-2">
                No topics yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Be the first to start a discussion!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className="cursor-pointer hover:border-accent/50 transition-colors"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {topic.is_pinned && (
                          <Pin className="h-4 w-4 text-accent shrink-0" />
                        )}
                        {topic.is_locked && (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <h3 className="font-medium truncate">{topic.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {topic.author_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(topic.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-2">
                        {isPrayerCategory ? (
                          <PrayerButton
                            praying={topicUserPrayers[topic.id] || false}
                            count={topicPrayerCounts[topic.id] || 0}
                            onClick={() => toggleTopicPrayer(topic.id)}
                            size="sm"
                          />
                        ) : (
                          <LikeButton
                            liked={topicUserLikes[topic.id] || false}
                            count={topicLikeCounts[topic.id] || 0}
                            onClick={() => toggleTopicLike(topic.id)}
                            size="sm"
                          />
                        )}
                        <Badge variant="secondary" className="text-xs">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {topic.post_count}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {topic.view_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTopicDetail = () => (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={() => {
          setSelectedTopic(null);
          setPosts([]);
        }}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Topics
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {selectedTopic?.is_pinned && (
              <Badge variant="secondary">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            {selectedTopic?.is_locked && (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
          <CardTitle>{selectedTopic?.title}</CardTitle>
          <CardDescription className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {selectedTopic?.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {selectedTopic &&
                formatDistanceToNow(new Date(selectedTopic.created_at), {
                  addSuffix: true,
                })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="whitespace-pre-wrap">{selectedTopic?.content}</p>
          {selectedTopic?.image_url && (
            <img
              src={selectedTopic.image_url}
              alt="Topic attachment"
              className="w-full max-h-96 object-contain rounded-lg"
            />
          )}
          {isPrayerCategory && selectedTopic && (
            <div className="flex items-center gap-3 pt-3 border-t">
              <PrayerButton
                praying={topicUserPrayers[selectedTopic.id] || false}
                count={topicPrayerCounts[selectedTopic.id] || 0}
                onClick={() => toggleTopicPrayer(selectedTopic.id)}
              />
              {(topicPrayerCounts[selectedTopic.id] || 0) > 0 && (
                <span className="text-sm text-muted-foreground">
                  {topicPrayerCounts[selectedTopic.id]} {topicPrayerCounts[selectedTopic.id] === 1 ? 'brother is' : 'brothers are'} praying for this request
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <h3 className="font-heading font-semibold text-lg">
        Replies ({posts.length})
      </h3>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No replies yet.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="py-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {post.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <LikeButton
                        liked={postUserLikes[post.id] || false}
                        count={postLikeCounts[post.id] || 0}
                        onClick={() => togglePostLike(post.id)}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt="Reply attachment"
                        className="mt-2 max-w-full max-h-64 object-contain rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!selectedTopic?.is_locked && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-3">
              <Textarea
                placeholder={
                  user ? "Write a reply..." : "Sign in to reply"
                }
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                disabled={!user}
                rows={3}
                maxLength={5000}
              />
              
              {/* Image Upload for Reply */}
              <div>
                <input
                  type="file"
                  ref={postImageRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(
                    e.target.files?.[0] || null,
                    setPostImage,
                    setPostImagePreview
                  )}
                />
                {postImagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={postImagePreview}
                      alt="Preview"
                      className="h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => {
                        setPostImage(null);
                        setPostImagePreview(null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => postImageRef.current?.click()}
                    disabled={!user}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                )}
              </div>

              <Button
                onClick={handleCreatePost}
                disabled={posting || uploadingImage || !user}
                className="w-full sm:w-auto"
              >
                {(posting || uploadingImage) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {uploadingImage ? "Uploading..." : "Post Reply"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
              <div>
                <h1 className="font-heading text-3xl font-bold mb-2">
                  Community Forum
                </h1>
                <p className="text-muted-foreground">
                  Connect with fellow members, share experiences, and get advice.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate("/accountability")}
                className="self-start"
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Find Accountability Partner
              </Button>
            </div>
          </div>

          {loading && !categories.length ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : selectedTopic ? (
            renderTopicDetail()
          ) : selectedCategory ? (
            renderTopicList()
          ) : (
            renderCategoryList()
          )}
        </div>
      </main>
    </div>
  );
};

export default Forum;
