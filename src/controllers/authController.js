const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { STATUS_TYPE } = require('../constants/common');

const signup = catchAsync(async (req, res, _next) => {
  /**
   * role default user olacak.
   * Email formatı doğru mu?
   * Şifre yeterince güçlü mü?
   * Şifre ile şifre doğrulama (passwordConfirm) uyuşuyor mu?
   * bcryptjs (veya bcrypt) Salt’lama + hash işlemi model içinde yapılmalı (örneğin userSchema.pre('save') hook’unda)
   */
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm });

  res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    },
  });
});

module.exports = {
  signup,
};
