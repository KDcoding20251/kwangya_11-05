// login-page.js
const FIREBASE_AUTH_DOMAIN = "@kwangya-system.com"; // 프로젝트에 맞게 변경하세요.

document.addEventListener("DOMContentLoaded", () => {
  // 1. HTML 요소 가져오기
  const loginForm = document.getElementById("login-form");
  const emailField = document.getElementById("username-field"); // Email로 사용
  const passwordField = document.getElementById("password-field");

  // 2. Firebase Auth 인스턴스 가져오기
  const auth = firebase.auth();

  // 3. 폼 제출 이벤트 리스너 등록
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(페이지 새로고침) 방지

    const inputId = emailField.value; // 사용자가 입력한 ID
    const password = passwordField.value;

    if (!inputId || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const email = inputId + FIREBASE_AUTH_DOMAIN; 

    // 4. Firebase 로그인 함수 호출
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // 로그인 성공
        const user = userCredential.user;
        alert(`로그인 성공! 환영합니다, ${inputId}님.`);
        window.location.href = "/";
        // TODO: 로그인 성공 후 이동할 페이지로 리다이렉트
        // window.location.href = "/main-page.html";
      })
      .catch((error) => {
        // 로그인 실패
        const errorCode = error.code;
        const errorMessage = error.message;
        
        // 사용자에게 친숙한 에러 메시지 표시
        switch (errorCode) {
          case 'auth/user-not-found':
            alert('등록되지 않은 아이디입니다.');
            break;
          case 'auth/wrong-password':
            alert('비밀번호가 올바르지 않습니다.');
            break;
          case 'auth/invalid-email':
            alert('유효하지 않은 아이디 형식입니다.');
            break;
          default:
            console.error("로그인 에러:", errorMessage);
            alert(`로그인 중 오류가 발생했습니다: ${errorMessage}`);
            break;
        }
      });
  });
});