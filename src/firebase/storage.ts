import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes,
    uploadBytesResumable,
    UploadResult,
    UploadTask,
} from 'firebase/storage';
import { storage } from './config';

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string
): Promise<UploadResult> => {
  const storageRef = ref(storage, path);
  return await uploadBytes(storageRef, file);
};

// Upload a file with progress tracking
export const uploadFileWithProgress = (
  file: File,
  path: string
): UploadTask => {
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
};

// Get download URL for a file
export const getFileDownloadURL = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
};

// Delete a file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  return await deleteObject(storageRef);
};

// Upload image and return download URL
export const uploadImageAndGetURL = async (
  file: File,
  path: string
): Promise<string> => {
  const uploadResult = await uploadFile(file, path);
  return await getDownloadURL(uploadResult.ref);
};

// Alias for uploadImageAndGetURL
export const uploadImage = uploadImageAndGetURL;