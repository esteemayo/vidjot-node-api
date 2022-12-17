const createSendToken = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  user.password = undefined;

  res
    .status(statusCode)
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .json(user);
};

module.exports = createSendToken;
