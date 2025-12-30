const Joi = require("joi");

const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),

  firstName: Joi.string().pattern(/^[A-Za-z]+$/).required(),
  lastName: Joi.string().pattern(/^[A-Za-z]+$/).required(),

  dob: Joi.date().iso().required(),

  email: Joi.string().email().required(),

  address: Joi.string().max(500).required(),

  gender: Joi.string().valid("male", "female").required(),

  department: Joi.string().required(),

  password: Joi.string()
  .min(8)
  .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase, number and special character"
  })

});

module.exports = signupSchema;
