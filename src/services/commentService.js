import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

// 创建评论
export const createComment = async (postId, userId, content, parentId = null) => {
  const commentRef = doc(collection(db, 'comments'));
  const commentData = {
    id: commentRef.id,
    postId,
    userId,
    content,
    parentId,
    likeCount: 0,
    replyCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'active'
  };

  await setDoc(commentRef, commentData);

  // 更新帖子评论数
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    commentCount: increment(1)
  });

  // 如果是回复其他评论，更新父评论的回复数
  if (parentId) {
    const parentRef = doc(db, 'comments', parentId);
    await updateDoc(parentRef, {
      replyCount: increment(1)
    });
  }

  return commentData;
};

// 获取帖子的评论（分页）
export const getPostComments = async (postId, lastComment = null, pageSize = 20) => {
  let q = query(
    collection(db, 'comments'),
    where('postId', '==', postId),
    where('parentId', '==', null), // 只获取顶级评论
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastComment) {
    q = query(q, startAfter(lastComment.createdAt));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 获取评论的回复
export const getCommentReplies = async (commentId, lastReply = null, pageSize = 10) => {
  let q = query(
    collection(db, 'comments'),
    where('parentId', '==', commentId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'asc'),
    limit(pageSize)
  );

  if (lastReply) {
    q = query(q, startAfter(lastReply.createdAt));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 更新评论
export const updateComment = async (commentId, content) => {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp(),
    isEdited: true
  });
};

// 删除评论（软删除）
export const deleteComment = async (commentId) => {
  const commentRef = doc(db, 'comments', commentId);
  const commentSnap = await getDoc(commentRef);
  
  if (!commentSnap.exists()) {
    throw new Error('评论不存在');
  }

  const commentData = commentSnap.data();
  
  // 更新评论状态
  await updateDoc(commentRef, {
    status: 'deleted',
    updatedAt: serverTimestamp()
  });

  // 更新帖子评论数
  const postRef = doc(db, 'posts', commentData.postId);
  await updateDoc(postRef, {
    commentCount: increment(-1)
  });

  // 如果是回复，更新父评论的回复数
  if (commentData.parentId) {
    const parentRef = doc(db, 'comments', commentData.parentId);
    await updateDoc(parentRef, {
      replyCount: increment(-1)
    });
  }
};

// 处理评论互动（点赞）
export const handleCommentInteraction = async (commentId, userId, type) => {
  const interactionRef = doc(db, 'comment_interactions', `${commentId}_${userId}_${type}`);
  const interactionDoc = await getDoc(interactionRef);

  if (interactionDoc.exists()) {
    // 取消互动
    await setDoc(interactionRef, {
      commentId,
      userId,
      type,
      createdAt: serverTimestamp(),
      active: false
    });

    if (type === 'like') {
      await updateDoc(doc(db, 'comments', commentId), {
        likeCount: increment(-1)
      });
    }
  } else {
    // 添加互动
    await setDoc(interactionRef, {
      commentId,
      userId,
      type,
      createdAt: serverTimestamp(),
      active: true
    });

    if (type === 'like') {
      await updateDoc(doc(db, 'comments', commentId), {
        likeCount: increment(1)
      });
    }
  }
}; 