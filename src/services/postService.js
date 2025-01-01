import { db, storage } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 生成帖子摘要
const generateSummary = (content, length = 200) => {
  const text = content.replace(/[#*`]/g, '').trim();
  return text.length > length ? text.slice(0, length) + '...' : text;
};

// 计算阅读时间（假设每分钟阅读 300 字）
const calculateReadingTime = (content) => {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 300);
};

// 上传封面图片
const uploadCoverImage = async (file, postId) => {
  if (!file) return null;
  const fileRef = ref(storage, `posts/${postId}/cover.${file.name.split('.').pop()}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// 创建或更新帖子
export const savePost = async (postData, userId, isDraft = true) => {
  const { title, content, category, tags, coverImage } = postData;
  
  // 生成帖子 ID（如果是新帖子）
  const postId = postData.id || doc(collection(db, 'posts')).id;
  
  // 处理标签
  const processedTags = tags.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // 渲染 Markdown 为 HTML
  const contentHtml = DOMPurify.sanitize(marked(content));
  
  // 计算元数据
  const metadata = {
    wordCount: content.length,
    readingTime: calculateReadingTime(content),
    lastEditedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  if (!postData.id) {
    metadata.createdAt = serverTimestamp();
  }

  if (!isDraft) {
    metadata.publishedAt = serverTimestamp();
  }

  // 上传封面图片
  let coverImageUrl = null;
  if (coverImage) {
    coverImageUrl = await uploadCoverImage(coverImage, postId);
  }

  // 构建帖子数据
  const postToSave = {
    id: postId,
    title,
    content,
    contentHtml,
    summary: generateSummary(content),
    category,
    tags: processedTags,
    authorId: userId,
    status: isDraft ? 'draft' : 'published',
    coverImage: coverImageUrl,
    metadata,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    featured: false,
    seo: {
      description: generateSummary(content, 160),
      keywords: [...processedTags, category],
      ogImage: coverImageUrl
    }
  };

  // 保存帖子
  const postRef = doc(db, 'posts', postId);
  
  if (!postData.id) {
    // 新帖子
    await setDoc(postRef, postToSave);
  } else {
    // 更新帖子
    const { id, ...updateData } = postToSave;
    await updateDoc(postRef, updateData);

    // 保存修订版本
    const revisionRef = doc(collection(db, 'post_revisions'));
    await setDoc(revisionRef, {
      id: revisionRef.id,
      postId,
      content,
      authorId: userId,
      createdAt: serverTimestamp(),
      reason: isDraft ? '保存草稿' : '更新发布'
    });
  }

  return postToSave;
};

// 获取帖子详情
export const getPost = async (postId) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (!postSnap.exists()) {
    throw new Error('帖子不存在');
  }

  // 更新浏览量
  await updateDoc(postRef, {
    viewCount: increment(1)
  });

  return postSnap.data();
};

// 获取用户的草稿
export const getDrafts = async (userId) => {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', userId),
    where('status', '==', 'draft'),
    orderBy('metadata.updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 获取用户的已发布帖子
export const getPublishedPosts = async (userId) => {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', userId),
    where('status', '==', 'published'),
    orderBy('metadata.publishedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};

// 更新帖子状态
export const updatePostStatus = async (postId, status) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    status,
    ...(status === 'published' ? {
      'metadata.publishedAt': serverTimestamp()
    } : {})
  });
};

// 处理用户互动
export const handlePostInteraction = async (postId, userId, type) => {
  const interactionRef = doc(db, 'post_interactions', `${postId}_${userId}_${type}`);
  const interactionDoc = await getDoc(interactionRef);

  if (interactionDoc.exists()) {
    // 取消互动
    await setDoc(interactionRef, {
      postId,
      userId,
      type,
      createdAt: serverTimestamp(),
      active: false
    });

    if (type === 'like') {
      await updateDoc(doc(db, 'posts', postId), {
        likeCount: increment(-1)
      });
    }
  } else {
    // 添加互动
    await setDoc(interactionRef, {
      postId,
      userId,
      type,
      createdAt: serverTimestamp(),
      active: true
    });

    if (type === 'like') {
      await updateDoc(doc(db, 'posts', postId), {
        likeCount: increment(1)
      });
    }
  }
}; 