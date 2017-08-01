import jwt from 'jsonwebtoken';

/**
 * @description jwt sign function
 * @param {string} id User Id
 * @param {string} email User Email
 * @param {string} roleId User Role Id
 * @returns {object} encoded token
 */
export default {
  sign: (id, email, roleId) =>
    jwt.sign(
      { id, email, roleId },
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 }
    ),
};
