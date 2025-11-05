// **main.html에 포함된 스크립트**

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const API_KEY = '1ddaaa3cb8a046139b70b2a8a938f5ba'; // 발급받은 API 키
const OFFICE_CODE = 'J10'; // 시도교육청 코드 (예: 서울특별시)
const SCHOOL_CODE = '7530934'; // 학교 고유 코드
const TODAY_DATE = getFormattedDate(); // 오늘 날짜 (YYYYMMDD 형식)
const API_URL = `https://open.neis.go.kr/hub/mealServiceDietInfo?` +
                `KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&` +
                `ATPT_OFCDC_SC_CODE=${OFFICE_CODE}&SD_SCHUL_CODE=${SCHOOL_CODE}&` +
                `MLSV_YMD=${TODAY_DATE}`;
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

let currentIdToken = null; // 현재 사용자의 토큰을 저장할 변수

// 2. 인증 상태 변화 감지
// 페이지 로드 시 또는 로그인/로그아웃 시 자동으로 실행됩니다.
onAuthStateChanged(auth, async (user) => {
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
        
        // 필요하다면 메인 페이지로 리다이렉트
        window.location.href = '/'; 
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

function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const POSTS_COLLECTION = "posts";
const LOSTS_COLLECTION = "losts"; 
const db = getFirestore(app); 

async function loadLatestPosts() {
    const postsListElement = document.getElementById('latestPostsList');
    if (!postsListElement) return;

    postsListElement.innerHTML = '<li class="post-item">최신 게시물을 불러오는 중...</li>'; // 로딩 메시지를 li 태그로 표시

    try {
        const q = query(
            collection(db, POSTS_COLLECTION), 
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        
        postsListElement.innerHTML = ''; // 목록 초기화

        if (querySnapshot.empty) {
            postsListElement.innerHTML = '<li class="post-item">아직 등록된 게시물이 없습니다.</li>';
            return;
        }

        // 3. HTML 요소 생성 및 표시 (첨부 이미지 구조 반영)
        querySnapshot.forEach((doc) => {
            const postId = doc.id; 
            const post = doc.data(); 
            
            // 💡 댓글 수는 임시로 0으로 설정합니다. (실제 댓글 수를 표시하려면 복잡한 쿼리가 필요함)
            const commentCount = 0; 
            const likeCount = 0;

            const date = new Date(post.createdAt);
            // '2025.08.29' 형식에 맞춰 날짜를 표시
            const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').slice(0, -1);

            const listItem = document.createElement('li');
            listItem.className = 'post-item';
            
            listItem.innerHTML = `
                <a href="post_detail.html?id=${postId}">${post.title}</a>
                
                <div class="post-info">
                    <span role="img" arialabel"좋아요 아이콘">👍</span> ${likeCount} | 
                    <span role="img" aria-label="댓글 아이콘">🗨️</span> ${commentCount} 
                    | ${formattedDate}
                </div>
            `;
            
            postsListElement.appendChild(listItem);
        });

    } catch (e) {
        console.error("메인 페이지 게시물 로드 중 오류 발생: ", e);
        postsListElement.innerHTML = '<li class="post-item" style="color: red;">게시물을 불러오는 데 실패했습니다.</li>';
    }
}

async function loadLatestLosts() {
    const lostsListElement = document.getElementById('latestLostsList');
    if (!lostsListElement) return;

    lostsListElement.innerHTML = '<li class="lost-item">최신 게시물을 불러오는 중...</li>'; // 로딩 메시지를 li 태그로 표시

    try {
        const q = query(
            collection(db, LOSTS_COLLECTION), 
            orderBy('createdAt', 'desc'),
            limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        
        lostsListElement.innerHTML = ''; // 목록 초기화

        if (querySnapshot.empty) {
            lostsListElement.innerHTML = '<li class="lost-item">아직 등록된 게시물이 없습니다.</li>';
            return;
        }

        // 3. HTML 요소 생성 및 표시 (첨부 이미지 구조 반영)
        querySnapshot.forEach((doc) => {
            const lostId = doc.id; 
            const lost = doc.data(); 
            
            // 💡 댓글 수는 임시로 0으로 설정합니다. (실제 댓글 수를 표시하려면 복잡한 쿼리가 필요함)
            const commentCount = 0; 
            const likeCount = 0;

            const date = new Date(lost.createdAt);
            // '2025.08.29' 형식에 맞춰 날짜를 표시
            const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').slice(0, -1);

            const listItem = document.createElement('li');
            listItem.className = 'lost-item';
            
            listItem.innerHTML = `
                <a href="lost_detail.html?id=${lostId}">${lost.title}</a>
                
                <div class="lost-info">
                    <span role="img" arialabel"좋아요 아이콘">👍</span> ${likeCount} | 
                    <span role="img" aria-label="댓글 아이콘">🗨️</span> ${commentCount} 
                    | ${formattedDate}
                </div>
            `;
            
            lostsListElement.appendChild(listItem);
        });

    } catch (e) {
        console.error("메인 페이지 게시물 로드 중 오류 발생: ", e);
        lostsListElement.innerHTML = '<li class="lost-item" style="color: red;">게시물을 불러오는 데 실패했습니다.</li>';
    }
}

// 4. 페이지 로드 시 게시물 불러오기 실행
document.addEventListener('DOMContentLoaded', loadLatestPosts, loadLatestLosts);

async function fetchMealData() {
    const menuContainer = document.getElementById('meal-menu');
    menuContainer.innerHTML = '급식 정보를 가져오는 중입니다...';

    try {
        // 1. API 호출
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 2. 데이터 파싱 및 확인
        // 나이스 API 응답 구조: data.mealServiceDietInfo[1].row
        const mealInfo = data.mealServiceDietInfo;
        
        if (mealInfo && mealInfo.length > 1 && mealInfo[1].row) {
            const mealList = mealInfo[1].row;
            
            // 3. HTML 생성
            let menuHTML = '';
            mealList.forEach(meal => {
                const mealTime = meal.MMEAL_SC_NM; // 예: 중식
                // DDLISH_NM (메뉴) 데이터에서 괄호 안의 알레르기 정보 등을 제거
                const dishName = meal.DDISH_NM.replace(/\([^)]+\)/g, '').split('<br/>').join(', '); 
                
                menuHTML += `
                    <div>
                        <h2>${mealTime}</h2>
                        <p>${dishName}</p>
                    </div>
                    <hr>
                `;
            });

            // 4. HTML에 반영
            menuContainer.innerHTML = menuHTML;

        } else {
            // 급식 데이터가 없는 경우
            menuContainer.innerHTML = `<p>⚠️ 오늘 급식 정보가 없습니다.</p>`;
        }

    } catch (error) {
        console.error('급식 정보를 가져오는 중 오류 발생:', error);
        menuContainer.innerHTML = `<p>❌ 오류 발생: 급식 정보를 불러올 수 없습니다.</p>`;
    }
}

// 함수 실행
fetchMealData();
