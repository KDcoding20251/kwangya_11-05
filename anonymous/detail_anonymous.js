// detail_script.js (닉네임 기능 제거)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js'; 
import { 
    doc, getDoc, getFirestore, collection, addDoc, 
    query, orderBy, getDocs 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"

// Firebase 설정 (유지)
// 1. Firebase 설정 (실제 프로젝트 설정으로 대체해야 합니다)
const firebaseConfig = {
    apiKey: "AIzaSyBEjBUuLnB8YGF4ZGf4fmriXXRnXTkKTk0",
    authDomain: "kwangya-e4917.firebaseapp.com",
    projectId: "kwangya-e4917",
    storageBucket: "kwangya-e4917.firebasestorage.app",
    messagingSenderId: "774380066093",
    appId: "1:774380066093:web:d76c79d669ed8e86a3efa4",
    measurementId: "G-HFCT75SE8P"
};
// ...

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🚨 닉네임 조회 함수 제거 (getNicknameByUid 함수 제거)

// -----------------------------------------------------------------------
// 1. URL에서 게시물 ID 가져오기 (유지)
// -----------------------------------------------------------------------
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// -----------------------------------------------------------------------
// 2. 게시물 로드 (수정: 닉네임 조회 제거)
// -----------------------------------------------------------------------

async function loadPostDetail() {
    const postId = getPostIdFromUrl();
    if (!postId) return;

    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
        const post = postDoc.data();
        const authorUid = post.authorUid; 
        
        // 🚨 닉네임 조회 로직 제거: authorNickname = await getNicknameByUid(authorUid);
        
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postContent').textContent = post.content;
        
        // ⭐ 수정: 닉네임 대신 UID나 '작성자' 텍스트 표시
        const authorElement = document.getElementById('postAuthor'); 
        if (authorElement) {
             // UID가 너무 길면 '익명' 등으로 표시하거나, UID 일부만 표시
            authorElement.textContent = `작성자 UID: ${authorUid.substring(0, 8)}...`;
        }
        
    } else {
        document.getElementById('postTitle').textContent = "게시물을 찾을 수 없습니다.";
    }

    loadComments(postId); 
}

// -----------------------------------------------------------------------
// 3. 댓글 저장 (유지)
// -----------------------------------------------------------------------

async function submitComment(postId) {
    const commentContent = document.getElementById('commentInput').value.trim();
    if (!commentContent) return;
    
    const user = auth.currentUser; 
    if (!user) return;
    
    await addDoc(collection(db, "posts", postId, "comments" ), {
        comment: commentContent,
        authorUid: user.uid,
        createdAt: Date.now(),
    });

    document.getElementById('commentInput').value = '';
    loadComments(postId); 
}

// -----------------------------------------------------------------------
// 4. 댓글 로드 (수정: 닉네임 로드 제거)
// -----------------------------------------------------------------------

async function loadComments(postId) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    const commentsQuery = query(
        collection(db, "posts", postId, "comments"), 
        orderBy('createdAt', 'asc') 
    );
    
    const snapshot = await getDocs(commentsQuery);
    
    const commentsData = snapshot.docs.map(doc => doc.data());
    
    // 🚨 닉네임 조회 로직 (Promise.all) 제거

    commentsData.forEach((comment) => {
        const commentDiv = document.createElement('div');
        const date = new Date(comment.createdAt).toLocaleDateString();

        commentDiv.className = 'comment-item';
        commentDiv.innerHTML = `
            <p>
                <strong>ㅇㅇ</strong> (${date}): ${comment.comment}
            </p>`;
        commentsList.appendChild(commentDiv);
    });
}

// -----------------------------------------------------------------------
// 페이지 로드 시 실행 (유지)
// -----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const postId = getPostIdFromUrl(); 
    if (!postId) return; 

    onAuthStateChanged(auth, (user) => {
        if (!user) {
            alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
            window.location.href = '/login/login.html'; 
            return;
        }
        loadPostDetail(postId); 
    });
    
    document.getElementById('submitComment').addEventListener('click', () => {
        submitComment(postId);
    });
});