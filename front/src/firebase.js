import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore ,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "e-commerce-5b7a0.firebaseapp.com",
  projectId: "e-commerce-5b7a0",
  storageBucket: "e-commerce-5b7a0.firebasestorage.app",
  messagingSenderId: "658955017973",
  appId: "1:658955017973:web:07125ea1e6dc024ceeefbc",
  measurementId: "G-34KX28KKS9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

export const registerWithLogin = async (login, password) => {
  const email = `${login}@yourchatdomain.com`;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    await setDoc(doc(db, "users", userCredential.user.uid), {
      login,
      createdAt: serverTimestamp()
    });
    return userCredential;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error.code));
  }
};

const getAuthErrorMessage = (code) => {
  switch(code) {
    case 'auth/email-already-in-use':
      return 'Login jest już zajęty';
    case 'auth/weak-password':
      return 'Hasło musi mieć co najmniej 6 znaków';
    default:
      return 'Wystąpił błąd';
  }
};

export const loginWithCredentials = async (login, password) => {
  const email = `${login}@yourchatdomain.com`;
  return signInWithEmailAndPassword(auth, email, password);
};

export const createNewChat = async (userId, userMessage) => {
  const chatId = Date.now().toString();

  const generateTitle = (content) => {
    if (!content) return "Nowa rozmowa";
    const cleanContent = content.length > 30 
      ? content.substring(0, 30) + "..."
      : content;
    return cleanContent;
  };
  
  const newChat = {
    chatId,
    title: generateTitle(userMessage?.content),
    messages: []
  };

  const userChatsRef = doc(db, "userChats", userId);

  const snap = await getDoc(userChatsRef);
  if (!snap.exists()) {
    await setDoc(userChatsRef, {
      userId,
      chats: [newChat]
    });
  } else {
    await updateDoc(userChatsRef, {
      chats: arrayUnion(newChat)
    });
  }

  return chatId;
};

export const addMessageToChat = async (userId, chatId, message) => {
  const userChatsRef = doc(db, "userChats", userId);
  
  const docSnap = await getDoc(userChatsRef);
  if (!docSnap.exists()) return;

  const chats = docSnap.data().chats || [];
  
  const updatedChats = chats.map(chat => {
    if (chat.chatId === chatId) {
      return {
        ...chat,
        messages: [...chat.messages, message],
        // updatedAt: serverTimestamp()
      };
    }
    return chat;
  });

  await updateDoc(userChatsRef, {
    chats: updatedChats
  });
};

export const getUserChats = async (userId) => {
  if (!userId) return [];
  
  const docRef = doc(db, "userChats", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, { userId, chats: [] });
    return [];
  }

  return docSnap.data().chats || [];
};

export const getChatById = async (userId, chatId) => {
  const chats = await getUserChats(userId);
  return chats.find(chat => chat.chatId === chatId);
};

export const deleteChat = async (userId, chatId) => {
    const userChatsRef = doc(db, "userChats", userId);
    const docSnap = await getDoc(userChatsRef);
    if (!docSnap.exists()) return;
  
    const chats = docSnap.data().chats || [];
    const filtered = chats.filter(c => c.chatId !== chatId);
  
    await updateDoc(userChatsRef, { chats: filtered });
};

export { auth };