const path = require('path');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json()); // 启用JSON解析
app.use(express.urlencoded({ extended: true })); // 启用URL编码解析


// 静态文件（如HTML、CSS、JS等）位于名为"public"的文件夹内
app.use(express.static(path.join(__dirname, 'public')));
// 设置默认路由，指向一个默认的首页
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 使用路由模块
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
const projectsRouter = require('./routes/projects');
app.use('/api/projects', projectsRouter);
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);
const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);


// 启动服务器
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));