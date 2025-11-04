// **main.html에 포함된 스크립트**

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
        window.location.href = '/introduce/introduce.html'; 
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