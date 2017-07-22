import jwt from 'jsonwebtoken';

export default {
  sign: (id, email, name, roleId) =>
    jwt.sign(
      { id, email, name, roleId },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 }
    ),
};
