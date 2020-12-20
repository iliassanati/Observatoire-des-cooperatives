import jwt from 'jsonwebtoken';

const generateToken = id => {
  const payload = {
    user: {
      id: user.id,
    },
  };

  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '30d' });
};

export default generateToken;
