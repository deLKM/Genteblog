import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const POSTS_STORAGE_KEY = 'blog_posts';
const POST_INTERACTIONS_KEY = 'blog_post_interactions';
const POST_REVISIONS_KEY = 'blog_post_revisions';

// 获取所有帖子
const getAllPosts = () => {
  const posts = localStorage.getItem(POSTS_STORAGE_KEY);
  return posts ? JSON.parse(posts) : [];
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
  const { title, content, category, tags, coverImage } = postData;
  const posts = getAllPosts();
  
  // 生成帖子 ID（如果是新帖子）
  const postId = postData.id || Date.now().toString();
  
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

  if (!postData.id) {
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

  if (!postData.id) {
    // 新帖子
    posts.push(postToSave);
  } else {
    // 更新帖子
    const index = posts.findIndex(post => post.id === postId);
    if (index === -1) throw new Error('帖子不存在');
    posts[index] = postToSave;

    // 保存修订版本
    const revisions = JSON.parse(localStorage.getItem(POST_REVISIONS_KEY) || '[]');
    revisions.push({
      id: Date.now().toString(),
      postId,
      content,
      authorId: userId,
      createdAt: now,
      reason: isDraft ? '保存草稿' : '更新发布'
    });
    localStorage.setItem(POST_REVISIONS_KEY, JSON.stringify(revisions));
  }

  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  return postToSave;
};

// 获取帖子详情
export const getPost = (postId) => {
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    throw new Error('帖子不存在');
  }

  // 更新浏览量
  post.viewCount += 1;
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));

  return post;
};

// 获取用户的草稿
export const getDrafts = (userId) => {
  const posts = getAllPosts();
  return posts
    .filter(post => post.authorId === userId && post.status === 'draft')
    .sort((a, b) => new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt));
};

// 获取用户的已发布帖子
export const getPublishedPosts = (userId) => {
  const posts = getAllPosts();
  return posts
    .filter(post => post.authorId === userId && post.status === 'published')
    .sort((a, b) => new Date(b.metadata.publishedAt) - new Date(a.metadata.publishedAt));
};

// 更新帖子状态
export const updatePostStatus = (postId, status) => {
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) throw new Error('帖子不存在');
  
  post.status = status;
  if (status === 'published') {
    post.metadata.publishedAt = new Date().toISOString();
  }
  
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  return post;
};

// 处理用户互动
export const handlePostInteraction = (postId, userId, type) => {
  const interactions = JSON.parse(localStorage.getItem(POST_INTERACTIONS_KEY) || '[]');
  const interactionId = `${postId}_${userId}_${type}`;
  const existingInteraction = interactions.find(i => i.id === interactionId);
  const posts = getAllPosts();
  const post = posts.find(p => p.id === postId);
  
  if (!post) throw new Error('帖子不存在');

  if (existingInteraction) {
    // 取消互动
    existingInteraction.active = false;
    existingInteraction.updatedAt = new Date().toISOString();
    
    if (type === 'like') {
      post.likeCount = Math.max(0, post.likeCount - 1);
    }
  } else {
    // 添加互动
    interactions.push({
      id: interactionId,
      postId,
      userId,
      type,
      createdAt: new Date().toISOString(),
      active: true
    });
    
    if (type === 'like') {
      post.likeCount += 1;
    }
  }

  localStorage.setItem(POST_INTERACTIONS_KEY, JSON.stringify(interactions));
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
}; 