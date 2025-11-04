// **main.html에 포함된 스크립트**

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js"

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const POSTS_COLLECTION = "posts";

let currentIdToken = null; // 현재 사용자의 토큰을 저장할 변수

document.addEventListener('DOMContentLoaded', () => {

    // 2. 인증 상태 변화 감지
    // 페이지 로드 시 또는 로그인/로그아웃 시 자동으로 실행됩니다.
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // ⭐ 사용자가 로그인되지 않은 상태일 경우
            alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
            // 로그인 페이지로 강제 리다이렉트
            window.location.href = '/login/login.html'; // 'login.html' 경로는 실제 경로에 맞게 수정하세요.
            return; // 리다이렉트 후 이후 로직 실행 중단
        } 

        document.getElementById('submitPost').addEventListener('click', savePost);

        // 4. 게시물 불러오기 함수 실행
        loadPosts();

        if (user) {
            // 사용자 로그인 상태
            // 토큰을 가져와 로컬에 저장하거나 변수에 보관합니다.
            try {
                currentIdToken = await user.getIdToken(); 
                // 로컬 스토리지에 저장 (선택 사항이지만, 다른 스크립트에서 접근하기 편리함)
                localStorage.setItem('authToken', currentIdToken);
            } catch (error) {
                console.error("ID 토큰을 가져오는 데 실패했습니다:", error);
                currentIdToken = null;
                localStorage.removeItem('authToken');
            }
            
        } else {
            // 사용자 로그아웃 상태
            currentIdToken = null;
            localStorage.removeItem('authToken');
        }
        
        // 상태가 변경되었으므로 버튼을 업데이트합니다.
        updateAuthButton(!!user); // user 객체가 있으면 true, 없으면 false 전달
    });
    
    // 참고: 기존 loadPosts() 함수 호출은 onAuthStateChanged 안으로 이동해야 합니다.
    // 기존의 document.addEventListener('DOMContentLoaded', loadPosts); 호출은 제거하세요.
})

// **main.html에 포함된 스크립트 (A 섹션 이후)**

const authButton = document.getElementById('authButton');

// 3. 버튼 업데이트 함수 수정
// isUserLoggedIn() 대신 현재 Firebase 상태(isLoggedIn)를 인수로 받습니다.
function updateAuthButton(isLoggedIn) {
    if (!authButton) return;

    // 이전 이벤트 핸들러 제거 (Firebase는 onAuthStateChanged 내에서 관리되므로 더 단순화될 수 있습니다.)
    authButton.onclick = null; 

    if (isLoggedIn) {
        // **로그인 상태: '로그아웃' 버튼**
        authButton.textContent = '로그아웃';
        authButton.classList.remove('login');
        authButton.classList.add('logout');
        authButton.onclick = handleLogout; // Firebase 로그아웃 함수 연결
    } else {
        // **로그아웃 상태: '로그인' 버튼**
        authButton.textContent = '로그인';
        authButton.classList.add('login');
        authButton.classList.remove('logout');
        authButton.onclick = handleLoginRedirect; // 로그인 페이지 리다이렉트 함수 연결
    }
}

// 4. 로그아웃 처리 함수 (Firebase SDK 사용)
function handleLogout() {
    // Firebase의 signOut 함수를 호출
    signOut(auth).then(() => {
        alert('로그아웃되었습니다.');
        // onAuthStateChanged 리스너가 호출되어 자동으로 상태(currentIdToken)를 정리하고
        // updateAuthButton(false)를 실행합니다.
        
        // 필요하다면 로그인 페이지로 리다이렉트
        window.location.href = '/login/login.html'; 
    }).catch((error) => {
        console.error("로그아웃 실패:", error);
        alert('로그아웃 중 오류가 발생했습니다.');
    });
}

// 5. 로그인 페이지로 리다이렉트하는 함수
function handleLoginRedirect() {
    window.location.href = '/login/login.html';
}

// **참고:** onAuthStateChanged는 페이지 로드 시 Firebase 상태를 확인하고
// 자동으로 updateAuthButton을 실행하므로, DOMContentLoaded 리스너는 필수가 아닙니다.

//////////////////////////////////

async function savePost() {
    // 1. 제목과 내용 필드 가져오기
    const postTitleElement = document.getElementById('postTitle');
    const postContentElement = document.getElementById('postContent');
    
    const title = postTitleElement.value.trim();
    const content = postContentElement.value.trim();

    // 2. 제목과 내용 모두 검사
    if (!title) {
        alert("제목을 입력해주세요.");
        return;
    }
    if (!content) {
        alert("내용을 입력해주세요.");
        return;
    }

    try {
        // 3. Firestore에 'title' 필드를 포함하여 저장
        const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
            title: title, // ⭐ 제목 필드 추가
            content: content,
            author: "익명의 사용자",
            // 서버 타임스탬프를 사용하는 것이 더 정확하고 권장됨
            createdAt: Date.now() 
        });

        alert("게시물이 성공적으로 작성되었습니다!");
        
        // 4. 입력 필드 초기화
        postTitleElement.value = ''; 
        postContentElement.value = ''; 
        
        // 새 게시물을 화면에 즉시 로드
        loadPosts(); 

    } catch (e) {
        console.error("게시물 작성 중 오류 발생: ", e);
        alert("게시물 작성에 실패했습니다.");
    }
}

// 4. 이벤트 리스너 연결
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('submitPost').addEventListener('click', savePost);
});

// 5. 게시물 불러오기 함수
async function loadPosts() {
    const postsListElement = document.getElementById('postsList');
    postsListElement.innerHTML = '<p>게시물을 불러오는 중...</p>'; // 로딩 표시

    try {
        // 'anonymousPosts' 컬렉션에서 'createdAt' 기준으로 내림차순 정렬하여 쿼리
        const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
        
        // 쿼리 실행
        const querySnapshot = await getDocs(q);
        
        // 게시물 목록 초기화
        postsListElement.innerHTML = ''; 

        if (querySnapshot.empty) {
            postsListElement.innerHTML = '<p>아직 게시물이 없습니다.</p>';
            return;
        }

        // 각 문서(게시물)를 순회하며 HTML 요소 생성
        querySnapshot.forEach((doc) => {
            const postId = doc.id; // Firestore 문서 ID를 게시물 ID로 사용
            const post = doc.data(); // 문서 데이터 가져오기
            // 타임스탬프를 읽기 쉬운 형태로 변환
            const date = new Date(post.createdAt);
            const formattedDate = date.toLocaleString();

            const postDiv = document.createElement('div');
            postDiv.className = 'post-item';
            
            postDiv.innerHTML = `
                <h3><a href="../post_detail.html?id=${postId}">${post.title}</a></h3> 
                <p>작성자: ${post.author} | ${formattedDate}</p>
                <hr>
            `;
            
            postsListElement.appendChild(postDiv);
        });

    } catch (e) {
        console.error("게시물 로드 중 오류 발생: ", e);
        postsListElement.innerHTML = '<p style="color: red;">게시물을 불러오는 데 실패했습니다.</p>';
    }
}

// 6. 페이지 로드 시 게시물 불러오기
document.addEventListener('DOMContentLoaded', loadPosts);