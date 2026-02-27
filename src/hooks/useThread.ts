
import { useThreadData } from './forum/useThreadData';
import { useForumPost } from './forum/useForumPost';
import { useThreadLock } from './forum/useThreadLock';
import { useThreadStick } from './forum/useThreadStick';
import { useViewTracking } from './forum/useViewTracking';

export function useThread(threadId: number, page: number = 1, postsPerPage: number = 10) {
  const threadQuery = useThreadData(threadId, page, postsPerPage);
  const { createPost, editPost, deletePost } = useForumPost(threadId);
  const { toggleThreadLock } = useThreadLock(threadId);
  const { toggleThreadSticky } = useThreadStick();
  const { viewTracked, trackView } = useViewTracking(threadId, threadQuery.data?.thread.view_count);

  return {
    ...threadQuery,
    createPost,
    editPost,
    deletePost,
    toggleThreadLock,
    toggleThreadSticky,
    trackView,
    viewTracked
  };
}
