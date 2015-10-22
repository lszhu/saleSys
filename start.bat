# 准备工作，进入相应目录中，安装以来的npm包--------------------
#cd saleSys
#cd programs/server && npm install
#
# 注意：如果package.json中的fiber编译安装，需要visual studio
# -----------------------------------------------------------

set initAccount={"username": "admin", "password": "admin"}
set voucherDir={"storeDir": "/voucher", "uploadDir": "/upload", "tmpDir": "/upload/tmp"}
set METEOR_SETTINGS={"initAccount": %initAccount%, "voucherDir": %voucherDir%}
set initAccount=
set voucherDir=
set ROOT_URL=http://localhost
set PORT=3000
set MONGO_URL=mongodb://salesys:salesys@localhost:27017/salesys
node main.js