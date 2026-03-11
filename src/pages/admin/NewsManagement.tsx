
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Newspaper, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsManagement = () => {
  const { manager } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  if (!manager?.is_admin || manager.is_admin <= 1) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: articles, isLoading } = useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const data = await apiFetch<{ success: boolean; articles: any[] }>('/admin/news');
      return data.articles;
    }
  });

  const createNewsMutation = useMutation({
    mutationFn: async (newsData: { title: string; content: string }) => {
      return apiFetch('/admin/news', {
        method: 'POST',
        body: JSON.stringify({ ...newsData, author_id: manager.user_id, is_published: true })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['community-news'] });
      toast({ title: t('news.articleCreated') });
      setIsCreating(false);
      setFormData({ title: '', content: '' });
    },
    onError: (error: any) => {
      toast({ title: t('news.errorCreating'), description: error.message, variant: "destructive" });
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, newsData }: { id: number; newsData: { title: string; content: string } }) => {
      return apiFetch(`/admin/news/${id}`, {
        method: 'PUT',
        body: JSON.stringify(newsData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['community-news'] });
      toast({ title: t('news.articleUpdated') });
      setEditingId(null);
      setFormData({ title: '', content: '' });
    },
    onError: (error: any) => {
      toast({ title: t('news.errorUpdating'), description: error.message, variant: "destructive" });
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      return apiFetch(`/admin/news/${id}/publish`, {
        method: 'PUT',
        body: JSON.stringify({ is_published: !isPublished })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['community-news'] });
      toast({ title: t('news.publishUpdated') });
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/admin/news/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['community-news'] });
      toast({ title: t('news.articleDeleted') });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: t('news.fillFields'), variant: "destructive" });
      return;
    }
    if (editingId) {
      updateNewsMutation.mutate({ id: editingId, newsData: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const startEdit = (article: any) => {
    setEditingId(article.id);
    setFormData({ title: article.title, content: article.content });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', content: '' });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{t('news.management')}</h1>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('news.createBtn')}
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? t('news.editTitle') : t('news.createTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('news.labelTitle')}</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter article title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('news.labelContent')}</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter article content..."
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createNewsMutation.isPending || updateNewsMutation.isPending}>
                  {editingId ? t('news.updateBtn') : t('news.createArticle')}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>{t('news.cancel')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('news.articlesTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="border rounded p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        By {article.author?.username} • {new Date(article.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mb-3">
                        {article.content.length > 150 ? `${article.content.substring(0, 150)}...` : article.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${article.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {article.is_published ? t('news.published') : t('news.draft')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => togglePublishMutation.mutate({ id: article.id, isPublished: article.is_published })}>
                        {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteNewsMutation.mutate(article.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">{t('news.noArticles')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManagement;
