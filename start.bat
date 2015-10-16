# 准备工作，进入相应目录中，安装以来的npm包--------------------
#cd saleSys
#cd programs/server && npm install
#
# 注意：如果package.json中的fiber（由Meteor定制的）包无法编译安装，
# 则修改对应以来条目，直接装原始的fiber包（需要visual studio）
# -----------------------------------------------------------

set ROOT_URL=http://localhost
set PORT=3000
set MONGO_URL=mongodb://salesys:salesys@localhost:27017/salesys
node main.js