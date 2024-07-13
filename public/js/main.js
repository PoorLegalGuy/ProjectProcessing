import user_m from './user_m.js';
import project_m from './project_m.js';
import task_m from './task_m.js';
import log from './log.js';

const chk_token = (token, func) => {
    if (!token) {
        alert('请先登录');
        window.location.href = 'index.html'; // 返回登录页面
        return;
    } else {
        func();
    }
}

// UTC转换CSTfunction
const utcToCst = (utcTime, select=1) => {
    const utcDate = new Date(utcTime);
    const chinaTimeOffset = 8 * 60 * 60 * 1000;
    const cstDate = new Date(utcDate.getTime() + chinaTimeOffset);
    let cstTime = '';
    if (select == 1) {
        cstTime = cstDate.toISOString().slice(0, 10); // 不包含时分秒
    } else if (select == 2) {
        cstTime = cstDate.toISOString().slice(0, 19).replace('T', ' '); // 包含时分秒
    }
    return cstTime;
}

const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 根据用户角色不同显示不同页面内容
const initNav = () => {
    const login_role = window.sessionStorage.getItem('login_role');
    if (login_role == '系统管理员') {
        document.querySelector('#project_m').classList.add('d-none');
        document.querySelector('#task_m').classList.add('d-none');
    } else if (login_role == '项目经理' || login_role == '项目成员') {
        document.querySelector('#user_m').classList.add('d-none');
        document.querySelector('#sys_log').classList.add('d-none');
    }
}

// 导航栏高亮
const active_nav = (target) => {
    if (!document.querySelector(target).classList.contains('active')) {
        document.querySelectorAll('.nav-link').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(target).classList.add('active');
    }
}

const initTittle = (string) => {
    if (document.querySelector('#nav_title').innerHTML != string || document.title != string) {
        document.querySelector('#nav_title').innerHTML = string;
        document.title = string;    
    } else {
        return;
    }
}

const loadContent = (hash) => {
    switch (hash) {
        case '#/':
            document.querySelector('#content').innerHTML = '<div class="col-md-12 bg-black text-white p-4"><h1 class="text-center">欢迎使用项目进度管理系统</h1></div>';
            // document.title = '项目进度管理系统';
            // document.querySelector('#nav_title').innerHTML = '项目进度管理系统';
            initTittle('项目进度管理系统');
            break;

        // 用户管理
        case '#user_manage':
            active_nav('#user_m');
            initTittle('项目进度管理系统--用户管理');
            user_m.userManage();
            break;

        // 项目管理
        case '#project_manage':
            active_nav('#project_m');
            initTittle('项目进度管理系统--项目管理');
            project_m.projectManage();
            break;

        // 任务管理
        case '#task_manage':
            active_nav('#task_m');
            initTittle('项目进度管理系统--任务管理');
            task_m.taskManage();
            break;

        // 系统日志
        case '#log':
            active_nav('#sys_log');
            initTittle('项目进度管理系统--系统日志');
            log.getLogsList();
            break;

        // 用户密码重置
        // case '#user_resetPassword':
        //     active_nav('#user_resetPassword');
        //     // initTittle('项目进度管理系统--密码重置');
        //     user_m.userPasswordReset();
        //     break;

        // 退出登录
        case '#logout':
            window.sessionStorage.clear(); // 清除sessionStorage
            window.location.href = 'index.html'; // 返回登录页面
            break;
        default:
            document.querySelector('#content').innerHTML = '<div class="col-md-12 bg-black text-white p-4"><h1 class="text-center">欢迎使用项目进度管理系统</h1></div>';
            break;
    }
};

// 页面加载完成
document.addEventListener('DOMContentLoaded', () => {
    loadContent(window.location.hash); // 根据hash加载页面内容
    initNav();
    // 监听hash变化，加载不同页面内容
    window.addEventListener('hashchange', () => {
        loadContent(window.location.hash);
        initNav();
    });
    // 监听页面刷新
    window.addEventListener('load', () => {
        if (document.querySelector('#footer')) {
            document.querySelector('#footer div p').innerHTML = `当前登录用户：${window.sessionStorage.getItem('login_name')} ${window.sessionStorage.getItem('login_role')}`;
        }
        initNav();
    });

    // 监听导航栏点击事件
    document.querySelector('#navbarNav').addEventListener('click', (e) => {
        if (document.querySelector('#navbarNav a.active')) {
            document.querySelector('#navbarNav a.active').classList.remove('active');
        }
        e.target.classList.add('active');
        document.querySelector('#navbarNav').classList.toggle('show');
        console.log(e.target);
    });

    // 监听密码重置按钮
    document.querySelector('#user_resetPassword').addEventListener('click', (e) => {
        e.preventDefault();
        user_m.userPasswordReset();
    });
});

export default {chk_token, utcToCst, formatDateTime}