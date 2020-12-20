import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  //Get token from header
  let token;
  token = req.headers.authorization.split(' ')[1];

  //check if not token
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.user = decoded.user;
      console.log(req.user);
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
};

export { auth };

//   //Get token from header hello
//   const token = req.header('x-auth-token');

//   //check if not token
//   if (!token) {
//     return res.status(401).json({ msg: 'No token, authorization denied' });
//   }

//   //verify token
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_KEY);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ msg: 'Token is not valid' });
//   }
// };
