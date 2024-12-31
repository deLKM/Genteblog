import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// 生成唯一的文件名
const generateUniqueFileName = (file) => {
  const extension = file.name.split('.').pop();
  return `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
};

// 上传封面图片
const uploadCoverImage = async (file) => {
  if (!file) return null;
  
  const fileName = generateUniqueFileName(file);
  const storageRef = ref(storage, `covers/${fileName}`);
  
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

// 保存文章（草稿或发布）
export const savePost = async (postData, userId, isDraft = true) => {
  try {
    // 上传封面图片（如果有）
    const coverImageUrl = await uploadCoverImage(postData.coverImage);
    
    // 准备文章数据
    const post = {
      title: postData.title,
      content: postData.content,
      category: postData.category,
      tags: postData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      authorId: userId,
      coverImage: coverImageUrl,
      isDraft,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0,
      comments: []
    };
    
    // 添加到 Firestore
    const docRef = await addDoc(collection(db, 'posts'), post);
    
    return {
      id: docRef.id,
      ...post
    };
  } catch (error) {
    console.error('保存文章失败:', error);
    throw error;
  }
};

// 更新文章
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    // 如果有新的封面图片，先上传
    let coverImageUrl = postData.coverImage;
    if (postData.coverImage instanceof File) {
      coverImageUrl = await uploadCoverImage(postData.coverImage);
    }
    
    const updatedData = {
      ...postData,
      coverImage: coverImageUrl,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(postRef, updatedData);
    
    return {
      id: postId,
      ...updatedData
    };
  } catch (error) {
    console.error('更新文章失败:', error);
    throw error;
  }
}; 