该项目数据库使用数据库版本是MariaDB 10
workprocess_sample.sql 文件是系统的数据库模板，可自行导入并设置具备相应权限的用户

Node.js上默认使用3000端口，系统Docker部署方式：

  docker run -d --name projectp -p 3000:3000 --hostname projectp -e DB_HOST=(数据库IP地址) DB_USER=(数据库登录用户名) DB_PASSWORD=(数据库登录用户密码) DB_NAME=(数据库名称) DB_PORT=(数据库端口，默认3306) crpi-qklknm5do55kje7c.cn-guangzhou.personal.cr.aliyuncs.com/wjosh/projectp:v1.0


当忘记用户密码时可以通过set_pwd.js获取加密后的密码字符串：

  node set_pwd.js NEW_PASSWORD_STRING

输出结果为加密后的密码字符串，对数据库中的用户密码进行替换
