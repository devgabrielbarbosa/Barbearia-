import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAglEXBnzTRLPQzt-5z98MnEEXThoDwLSI",
  authDomain: "barbearia-ef8ce.firebaseapp.com",
  projectId: "barbearia-ef8ce",
  storageBucket: "barbearia-ef8ce.firebasestorage.app",
  messagingSenderId: "813385275105",
  appId: "1:813385275105:web:0ac7c4fe9d0d831e4349a0",
  measurementId: "G-V7TCCLZ4TC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
