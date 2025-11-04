const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // JSON 형식의 요청 본문 파싱

app.use('/public', express.static('public'));
// 이 설정이 login/login.html이 요청하는 CSS/JS 파일을 찾게 해줍니다.
app.use(express.static(path.join(__dirname, 'login'))); 
app.use(express.static(path.join(__dirname, 'anonymous'))); 
app.use(express.static(path.join(__dirname, 'introduce'))); 
app.use(express.static(path.join(__dirname, 'lost'))); 


// 루트 (/) 요청 시 main.html 제공 (기존 설정 확인)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});


// 로그인 페이지 라우팅
app.get('/login/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login', 'login.html'));
});

// 익명게시판 페이지 라우팅
app.get('/anonymous/anonymous.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'anonymous', 'anonymous.html'));
});

// 소개 페이지 라우팅
app.get('/introduce/introduce.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'introduce', 'introduce.html'));
});

// 분실물 페이지 라우팅
app.get('/lost/lost.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'lost', 'lost.html'));
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
