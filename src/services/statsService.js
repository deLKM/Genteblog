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

// 更新帖子统计
export const updatePostStats = async (postId, stats) => {
  const postRef = doc(db, 'posts', postId);
  const statsRef = doc(db, 'post_stats', postId);

  await Promise.all([
    updateDoc(postRef, stats),
    setDoc(statsRef, {
      ...stats,
      updatedAt: serverTimestamp()
    }, { merge: true })
  ]);
};

// 获取热门帖子
export const getHotPosts = async (timeRange = '7d', pageSize = 10) => {
  const now = new Date();
  let startTime;

  switch (timeRange) {
    case '24h':
      startTime = new Date(now - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
  }

  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'published'),
    where('metadata.publishedAt', '>=', startTime),
    orderBy('metadata.publishedAt', 'desc'),
    orderBy('viewCount', 'desc'),
    limit(pageSize)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 获取用户统计
export const getUserStats = async (userId) => {
  const postsQuery = query(
    collection(db, 'posts'),
    where('authorId', '==', userId),
    where('status', '==', 'published')
  );

  const likesQuery = query(
    collection(db, 'post_interactions'),
    where('userId', '==', userId),
    where('type', '==', 'like'),
    where('active', '==', true)
  );

  const commentsQuery = query(
    collection(db, 'comments'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );

  const [postsSnap, likesSnap, commentsSnap] = await Promise.all([
    getDocs(postsQuery),
    getDocs(likesQuery),
    getDocs(commentsQuery)
  ]);

  return {
    postCount: postsSnap.size,
    likeCount: likesSnap.size,
    commentCount: commentsSnap.size
  };
};

// 计算帖子热度分数
export const calculateHotScore = (post) => {
  const now = new Date();
  const publishedAt = post.metadata.publishedAt.toDate();
  const ageInHours = (now - publishedAt) / (1000 * 60 * 60);

  // 热度计算公式：(点赞数 * 4 + 评论数 * 2 + 收藏数 * 3 + 浏览数 / 100) / (年龄小时 + 2)^1.8
  const score = (
    post.likeCount * 4 +
    post.commentCount * 2 +
    (post.bookmarkCount || 0) * 3 +
    post.viewCount / 100
  ) / Math.pow(ageInHours + 2, 1.8);

  return score;
};

// 更新热门帖子列表（定时任务调用）
export const updateHotPosts = async () => {
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'published'),
    orderBy('metadata.publishedAt', 'desc'),
    limit(1000) // 取最近的1000篇文章计算热度
  );

  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // 计算热度分数并排序
  const scoredPosts = posts
    .map(post => ({
      ...post,
      hotScore: calculateHotScore(post)
    }))
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 100); // 只保留前100篇

  // 批量更新热度分数
  const batch = writeBatch(db);
  scoredPosts.forEach(post => {
    const postRef = doc(db, 'posts', post.id);
    batch.update(postRef, {
      hotScore: post.hotScore,
      'metadata.lastHotScoreUpdate': serverTimestamp()
    });
  });

  await batch.commit();

  // 更新热门帖子列表
  await setDoc(doc(db, 'system', 'hotPosts'), {
    posts: scoredPosts.map(post => post.id),
    updatedAt: serverTimestamp()
  });
}; 