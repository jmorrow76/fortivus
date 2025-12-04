import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  post_count?: number;
  author_name?: string;
}

interface Post {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Dumbbell,
  Apple,
  Heart,
  Trophy,
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
      const { data, error } = await supabase
        .from("forum_topics")
        .insert({
          category_id: selectedCategory,
          user_id: user.id,
          title: newTopicTitle.trim(),
          content: newTopicContent.trim(),
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
      const { error } = await supabase.from("forum_posts").insert({
        topic_id: selectedTopic.id,
        user_id: user.id,
        content: newPostContent.trim(),
      });

      if (error) throw error;

      toast({
        title: "Reply posted",
        description: "Your reply has been added to the discussion.",
      });

      setNewPostContent("");
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
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogDescription>
                  Start a new discussion in {category?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Topic title"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  maxLength={200}
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={5}
                  maxLength={5000}
                />
                <Button
                  onClick={handleCreateTopic}
                  disabled={posting}
                  className="w-full"
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Post Topic
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
                      <Badge variant="secondary" className="text-xs">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {topic.post_count}
                      </Badge>
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
        <CardContent>
          <p className="whitespace-pre-wrap">{selectedTopic?.content}</p>
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {post.author_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{post.content}</p>
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
              <Button
                onClick={handleCreatePost}
                disabled={posting || !user}
                className="w-full sm:w-auto"
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Post Reply
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
            <h1 className="font-heading text-3xl font-bold mb-2">
              Community Forum
            </h1>
            <p className="text-muted-foreground">
              Connect with fellow members, share experiences, and get advice.
            </p>
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
