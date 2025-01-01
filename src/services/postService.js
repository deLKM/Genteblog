import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 初始化数据库
const DB_NAME = 'BlogDB';
const DB_VERSION = 1;

// 压缩和解压工具函数
const compressContent = (content) => {
  try {
    return btoa(encodeURIComponent(content));
  } catch (error) {
    console.error('压缩内容失败:', error);
    return content;
  }
};

const decompressContent = (compressed) => {
  try {
    return compressed ? decodeURIComponent(atob(compressed)) : '';
  } catch (error) {
    console.error('解压内容失败:', error);
    return compressed || '';
  }
};

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
        postsStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('interactions')) {
        const interactionsStore = db.createObjectStore('interactions', { keyPath: 'id' });
        interactionsStore.createIndex('postId', 'postId', { unique: false });
        interactionsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('revisions')) {
        const revisionsStore = db.createObjectStore('revisions', { keyPath: 'id', autoIncrement: true });
        revisionsStore.createIndex('postId', 'postId', { unique: false });
        revisionsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// 数据库操作工具函数
const dbOperation = async (storeName, mode, operation) => {
  let db = null;
  try {
    db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => {
        if (db) {
          db.close();
        }
      };

      transaction.onerror = (event) => {
        console.error('事务错误:', event.target.error);
        reject(event.target.error);
      };

      transaction.onabort = (event) => {
        console.error('事务中止:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('数据库操作失败:', error);
    if (db) {
      db.close();
    }
    throw error;
  }
};

// 获取所有数据
const getAllFromStore = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 导入集合数据
const importCollection = async (store, items) => {
  for (const item of items) {
    await store.put(item);
  }
};

// 导出数据
export const exportData = async () => {
  try {
    const [posts, interactions, revisions] = await Promise.all([
      getAllFromStore('posts'),
      getAllFromStore('interactions'),
      getAllFromStore('revisions')
    ]);

    const exportData = {
      posts,
      interactions,
      revisions,
      exportDate: new Date().toISOString(),
      version: DB_VERSION
    };

    // 创建并下载文件
    const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  } catch (error) {
    console.error('导出数据失败:', error);
    throw error;
  }
};

// 导入数据
export const importData = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.version !== DB_VERSION) {
      throw new Error('数据版本不匹配');
    }

    const db = await openDB();
    const transaction = db.transaction(['posts', 'interactions', 'revisions'], 'readwrite');

    try {
      await Promise.all([
        importCollection(transaction.objectStore('posts'), data.posts),
        importCollection(transaction.objectStore('interactions'), data.interactions),
        importCollection(transaction.objectStore('revisions'), data.revisions)
      ]);
      
      return true;
    } catch (error) {
      transaction.abort();
      throw error;
    }
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
};

// 清理过期数据
export const cleanupOldData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    const db = await openDB();
    const transaction = db.transaction(['revisions', 'interactions'], 'readwrite');

    // 清理旧的修订记录
    const revisionsStore = transaction.objectStore('revisions');
    const revisionsIndex = revisionsStore.index('createdAt');
    const revisionsRequest = revisionsIndex.openCursor(IDBKeyRange.upperBound(thirtyDaysAgoStr));

    await new Promise((resolve, reject) => {
      revisionsRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      revisionsRequest.onerror = () => reject(revisionsRequest.error);
    });

    // 清理已取消的互动记录
    const interactionsStore = transaction.objectStore('interactions');
    const interactionsIndex = interactionsStore.index('updatedAt');
    const interactionsRequest = interactionsIndex.openCursor(IDBKeyRange.upperBound(thirtyDaysAgoStr));

    await new Promise((resolve, reject) => {
      interactionsRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const interaction = cursor.value;
          if (!interaction.active) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      interactionsRequest.onerror = () => reject(interactionsRequest.error);
    });

    return true;
  } catch (error) {
    console.error('清理过期数据失败:', error);
    throw error;
  }
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
      content: compressContent(content), // 压缩内容
      contentHtml: compressContent(contentHtml), // 压缩HTML
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
        content: compressContent(content),
        authorId: userId,
        createdAt: now,
        reason: isDraft ? '保存草稿' : '更新发布'
      };
      await dbOperation('revisions', 'readwrite', store => store.add(revision));
    }

    // 返回解压后的数据
    return {
      ...postToSave,
      content: content,
      contentHtml: contentHtml
    };
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

    // 解压内容
    post.content = decompressContent(post.content);
    post.contentHtml = decompressContent(post.contentHtml);

    // 更新浏览量
    post.viewCount = (post.viewCount || 0) + 1;
    await dbOperation('posts', 'readwrite', store => store.put({
      ...post,
      content: compressContent(post.content),
      contentHtml: compressContent(post.contentHtml)
    }));

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
  if (!userId) {
    console.error('无效的用户ID');
    return [];
  }

  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('posts', 'readonly');
        const store = transaction.objectStore('posts');
        const posts = [];

        // 使用索引来优化查询
        const authorIndex = store.index('authorId');
        const request = authorIndex.openCursor(IDBKeyRange.only(userId));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const post = cursor.value;
            if (post.status === 'published') {
              try {
                // 解压内容
                post.content = decompressContent(post.content);
                post.contentHtml = decompressContent(post.contentHtml);
                posts.push(post);
              } catch (error) {
                console.error('解压文章内容失败:', error);
                // 继续处理其他文章
              }
            }
            cursor.continue();
          } else {
            resolve(posts.sort((a, b) => 
              new Date(b.metadata.publishedAt) - new Date(a.metadata.publishedAt)
            ));
          }
        };
        
        request.onerror = (event) => {
          console.error('获取已发布帖子失败:', event.target.error);
          reject(event.target.error);
        };

        transaction.oncomplete = () => {
          db.close();
        };

        transaction.onerror = (event) => {
          console.error('事务失败:', event.target.error);
          reject(event.target.error);
        };

        transaction.onabort = (event) => {
          console.error('事务中止:', event.target.error);
          reject(event.target.error);
        };

      } catch (error) {
        console.error('创建事务失败:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('获取已发布帖子失败:', error);
    return []; // 返回空数组而不是抛出错误，避免组件崩溃
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