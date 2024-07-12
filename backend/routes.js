module.exports = app => {
  app.use('/api/users', require("./modules/user/user.routes")); 
};