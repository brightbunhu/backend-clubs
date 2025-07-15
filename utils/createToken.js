import jwt from 'jsonwebtoken';

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default createToken;
