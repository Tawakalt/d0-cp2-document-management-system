import jwt from 'jsonwebtoken';

export default {
  sign: (id, email, roleId) =>
    jwt.sign(
      { id, email, roleId },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 }
    ),
};
