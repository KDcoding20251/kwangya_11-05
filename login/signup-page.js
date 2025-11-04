// signup-page.js (변수 유효 범위 문제 해결 및 최종 통일)

// 💡 1. 사용자 정의 ID 도메인을 설정합니다. 
const FIREBASE_AUTH_DOMAIN = "@kwangya-system.com";

// ⭐🚨 수정: db 인스턴스를 전역에서 선언하여 isNicknameTaken 함수가 접근할 수 있도록 합니다.
// (HTML에 Firebase Firestore CDN이 로드되었다고 가정)
const db = firebase.firestore();

// ⭐ 닉네임 중복 검사 함수 (비동기) - db 접근 가능
async function isNicknameTaken(nickname) {
    if (!nickname) return false;
    try {
        const usersRef = db.collection("users");
        // 닉네임 필드가 입력된 닉네임과 일치하는 문서가 있는지 쿼리
        const q = usersRef.where("nickname", "==", nickname);
        const snapshot = await q.get();
        alert("이미 사용되는 닉네임입니다.");
        return !snapshot.empty;
    } catch (error) {
        // 이 오류는 주로 보안 규칙 위반 (Missing or insufficient permissions)이나
        // 네트워크 문제일 수 있으므로 사용자에게 알리고 안전하게 중복으로 처리합니다.
        console.error("닉네임 중복 검사 중 오류 발생 (보안 규칙 확인 필요):", error);
        alert("닉네임 검사 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        return true; 
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // 2. HTML 요소 가져오기
    const signupForm = document.getElementById("signup-form");
    const idField = document.getElementById("username-field"); 
    const passwordField = document.getElementById("password-field");
    const confirmPasswordField = document.getElementById("confirm-password-field");
    const nicknameField = document.getElementById('nickname-field'); 
    
    // 🚨 db 인스턴스는 이미 전역에서 가져왔으므로 여기서 다시 선언할 필요 없습니다.
    // const db = firebase.firestore(); // <- 이 줄을 제거했습니다.

    // 3. Firebase Auth 인스턴스 가져오기
    const auth = firebase.auth();

    // 4. 폼 제출 이벤트 리스너 등록
    signupForm.addEventListener("submit", async (e) => { 
        e.preventDefault(); 

        const inputId = idField.value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        const nickname = nicknameField.value.trim(); 
        
        // 입력값 유효성 검사 (유지)
        if (!inputId || !password || !confirmPassword || !nickname) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
        if (password.length < 6) {
            alert("비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        if (password !== confirmPassword) {
            alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        // ⭐ 닉네임 중복 검사 실행
        if (await isNicknameTaken(nickname)) {
            // isNicknameTaken 내부에서 이미 alert를 띄웠으므로 여기는 return만 합니다.
            return;
        }

        // 💡 5. ID를 Firebase 이메일 형식으로 변환
        const email = inputId + FIREBASE_AUTH_DOMAIN; 
        
        // 6. Firebase 회원가입 및 Firestore 저장 로직을 하나의 try-catch 블록으로 통합
        try {
            // 6. Firebase 회원가입 (await 사용)
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // ⭐ 7. Firestore에 닉네임 데이터 저장 (await 사용)
            const userRef = db.collection("users").doc(user.uid);
            await userRef.set({
                uid: user.uid,
                email: user.email,
                nickname: nickname, // 최종 닉네임 저장
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert(`회원가입 성공! ${nickname}님, 환영합니다.`);
            window.location.href = "/login.html";
            
        } catch (error) {
            // 회원가입 실패 및 Firestore 저장 실패를 모두 여기서 처리
            const errorCode = error.code;
            
            switch (errorCode) {
                case 'auth/email-already-in-use':
                    alert('이미 사용 중인 아이디입니다. 다른 아이디를 사용해주세요.');
                    break;
                case 'auth/invalid-email':
                    alert('유효하지 않은 아이디 형식입니다. 특수 문자를 확인해주세요.');
                    break;
                default:
                    console.error("회원가입/데이터 저장 에러:", error);
                    alert(`회원가입 중 오류가 발생했습니다: ${error.message}`);
                    break;
            }
        }
    });
});