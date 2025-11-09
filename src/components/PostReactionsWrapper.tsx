import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePostReactions } from '../hooks/usePostReactions';
import PostReactions from './PostReactions';

interface PostReactionsWrapperProps {
  postId: string;
  comments?: number;
  shares?: number;
  onComment?: () => void;
  onShare?: () => void;
}

const PostReactionsWrapper: React.FC<PostReactionsWrapperProps> = ({
  postId,
  comments = 0,
  shares = 0,
  onComment,
  onShare
}) => {
  const { user } = useAuth();
  
  const {
    reactions,
    reactionUsers,
    userReaction,
    loading,
    addReaction
  } = usePostReactions(
    postId,
    user?.id,
    user?.name || user?.email,
    user?.avatar
  );

  const handleReaction = async (type: 'like' | 'laugh' | 'wow' | 'sad' | 'angry' | 'support') => {
    await addReaction(type);
  };

  return (
    <PostReactions
      postId={postId}
      reactions={reactions}
      comments={comments}
      shares={shares}
      userReaction={userReaction}
      onReaction={handleReaction}
      onComment={onComment || (() => console.log('Comment clicked'))}
      onShare={onShare || (() => console.log('Share clicked'))}
      reactionUsers={reactionUsers.map(r => ({
        id: r.userId,
        name: r.userName,
        avatar: r.userAvatar,
        reactionType: r.reactionType
      }))}
      loading={{
        reaction: loading,
        share: false,
      }}
    />
  );
};

export default PostReactionsWrapper;