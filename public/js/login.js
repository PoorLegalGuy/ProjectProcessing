// 使用fetch处理登录和注册逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 监听登录表单提交事件
    document.querySelector("#loginForm").addEventListener("submit", async function(e){
        e.preventDefault();
        await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.querySelector("#loginUsername").value,
                password: document.querySelector("#loginPassword").value
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log(data.message);
            if (data.message == '登录成功') {
                sessionStorage.setItem('u_token', data.u_token); // 存入用户token
                sessionStorage.setItem('login_name', data.login_name) // 存入用户姓名
                sessionStorage.setItem('login_role', data.login_role); // 存入用户角色
                window.location.href = 'main.html'; //跳转到后台页面
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
    });
});

