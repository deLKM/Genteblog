import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 初始化数据库
const DB_NAME = 'BlogDB';
const DB_VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 创建存储对象
      if (!db.objectStoreNames.contains('posts')) {
        const postsStore = db.createObjectStore('posts', { keyPath: '_id' });
        postsStore.createIndex('authorId', 'authorId', { unique: false });
        postsStore.createIndex('status', 'status', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('interactions')) {
        const interactionsStore = db.createObjectStore('interactions', { keyPath: 'id' });
        interactionsStore.createIndex('postId', 'postId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('revisions')) {
        const revisionsStore = db.createObjectStore('revisions', { keyPath: 'id', autoIncrement: true });
        revisionsStore.createIndex('postId', 'postId', { unique: false });
      }
    };
  });
};

// 数据库操作工具函数
const dbOperation = async (storeName, mode, operation) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    
    const request = operation(store);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

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
  try {
    const { title, content, category, tags, coverImage } = postData;
    
    // 生成帖子 ID（如果是新帖子）
    const postId = postData._id || Date.now().toString();
    
    // 处理标签
    const processedTags = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // 渲染 Markdown 为 HTML
    const contentHtml = DOMPurify.sanitize(marked(content));
    
    // 计算元数据
    const now = new Date().toISOString();
    const metadata = {
      wordCount: content.length,
      readingTime: calculateReadingTime(content),
      lastEditedAt: now,
      updatedAt: now
    };

    if (!postData._id) {
      metadata.createdAt = now;
    }

    if (!isDraft) {
      metadata.publishedAt = now;
    }

    // 上传封面图片
    let coverImageUrl = null;
    if (coverImage) {
      coverImageUrl = await uploadCoverImage(coverImage, postId);
    }

    // 构建帖子数据
    const postToSave = {
      _id: postId,
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
      viewCount: postData.viewCount || 0,
      likeCount: postData.likeCount || 0,
      commentCount: postData.commentCount || 0,
      featured: postData.featured || false,
      seo: {
        description: generateSummary(content, 160),
        keywords: [...processedTags, category],
        ogImage: coverImageUrl
      }
    };

    // 保存帖子
    await dbOperation('posts', 'readwrite', store => store.put(postToSave));

    // 如果是更新操作，保存修订版本
    if (postData._id) {
      const revision = {
        postId,
        content,
        authorId: userId,
        createdAt: now,
        reason: isDraft ? '保存草稿' : '更新发布'
      };
      await dbOperation('revisions', 'readwrite', store => store.add(revision));
    }

    return postToSave;
  } catch (error) {
    console.error('保存帖子失败:', error);
    throw error;
  }
};

// 获取帖子详情
export const getPost = async (postId) => {
  try {
    const post = await dbOperation('posts', 'readwrite', store => store.get(postId));
    if (!post) {
      throw new Error('帖子不存在');
    }

    // 更新浏览量
    post.viewCount = (post.viewCount || 0) + 1;
    await dbOperation('posts', 'readwrite', store => store.put(post));

    return post;
  } catch (error) {
    console.error('获取帖子失败:', error);
    throw error;
  }
};

// 获取用户的草稿
export const getDrafts = async (userId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('posts', 'readonly');
      const store = transaction.objectStore('posts');
      const posts = [];

      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.authorId === userId && cursor.value.status === 'draft') {
            posts.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(posts.sort((a, b) => 
            new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt)
          ));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取草稿失败:', error);
    return [];
  }
};

// 获取用户的已发布帖子
export const getPublishedPosts = async (userId) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('posts', 'readonly');
      const store = transaction.objectStore('posts');
      const posts = [];

      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.authorId === userId && cursor.value.status === 'published') {
            posts.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(posts.sort((a, b) => 
            new Date(b.metadata.publishedAt) - new Date(a.metadata.publishedAt)
          ));
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('获取已发布帖子失败:', error);
    return [];
  }
};

// 更新帖子状态
export const updatePostStatus = async (postId, status) => {
  try {
    const post = await dbOperation('posts', 'readwrite', store => store.get(postId));
    if (!post) {
      throw new Error('帖子不存在');
    }

    post.status = status;
    if (status === 'published') {
      post.metadata.publishedAt = new Date().toISOString();
    }

    await dbOperation('posts', 'readwrite', store => store.put(post));
    return post;
  } catch (error) {
    console.error('更新帖子状态失败:', error);
    throw error;
  }
};

// 处理用户互动
export const handlePostInteraction = async (postId, userId, type) => {
  try {
    const interactionId = `${postId}_${userId}_${type}`;
    const post = await dbOperation('posts', 'readwrite', store => store.get(postId));
    if (!post) {
      throw new Error('帖子不存在');
    }

    const existingInteraction = await dbOperation('interactions', 'readonly', store => store.get(interactionId));
    
    if (existingInteraction) {
      // 取消互动
      existingInteraction.active = false;
      existingInteraction.updatedAt = new Date().toISOString();
      await dbOperation('interactions', 'readwrite', store => store.put(existingInteraction));
      
      if (type === 'like') {
        post.likeCount = Math.max(0, post.likeCount - 1);
      }
    } else {
      // 添加互动
      const interaction = {
        id: interactionId,
        postId,
        userId,
        type,
        createdAt: new Date().toISOString(),
        active: true
      };
      await dbOperation('interactions', 'readwrite', store => store.add(interaction));
      
      if (type === 'like') {
        post.likeCount = (post.likeCount || 0) + 1;
      }
    }

    await dbOperation('posts', 'readwrite', store => store.put(post));
  } catch (error) {
    console.error('处理用户互动失败:', error);
    throw error;
  }
}; 