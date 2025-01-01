import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

// 获取用户的收藏列表
export const getUserBookmarks = async (userId, lastBookmark = null, pageSize = 20) => {
  let q = query(
    collection(db, 'post_interactions'),
    where('userId', '==', userId),
    where('type', '==', 'bookmark'),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastBookmark) {
    q = query(q, startAfter(lastBookmark.createdAt));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 获取用户的点赞列表
export const getUserLikes = async (userId, lastLike = null, pageSize = 20) => {
  let q = query(
    collection(db, 'post_interactions'),
    where('userId', '==', userId),
    where('type', '==', 'like'),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastLike) {
    q = query(q, startAfter(lastLike.createdAt));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 检查用户是否已收藏/点赞
export const checkUserInteraction = async (postId, userId, type) => {
  const interactionRef = doc(db, 'post_interactions', `${postId}_${userId}_${type}`);
  const interactionDoc = await getDoc(interactionRef);
  
  return interactionDoc.exists() && interactionDoc.data().active;
};

// 获取帖子的互动统计
export const getPostInteractionStats = async (postId) => {
  const likeQuery = query(
    collection(db, 'post_interactions'),
    where('postId', '==', postId),
    where('type', '==', 'like'),
    where('active', '==', true)
  );

  const bookmarkQuery = query(
    collection(db, 'post_interactions'),
    where('postId', '==', postId),
    where('type', '==', 'bookmark'),
    where('active', '==', true)
  );

  const [likeSnapshot, bookmarkSnapshot] = await Promise.all([
    getDocs(likeQuery),
    getDocs(bookmarkQuery)
  ]);

  return {
    likeCount: likeSnapshot.size,
    bookmarkCount: bookmarkSnapshot.size
  };
};

// 获取用户的互动历史
export const getUserInteractionHistory = async (userId, lastInteraction = null, pageSize = 20) => {
  let q = query(
    collection(db, 'post_interactions'),
    where('userId', '==', userId),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  if (lastInteraction) {
    q = query(q, startAfter(lastInteraction.createdAt));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
}; 