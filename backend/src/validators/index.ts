import Joi from "joi";

// uuid validation
const uuid = Joi.string().uuid();

// id validation
const resourceId = {
  params: Joi.object().keys({
    id: uuid.required(),
  }),
};

// login validation
const userLogin = {
  body: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .min(2),
}

// user creation validation
const userCreation = {
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .min(3),
};

// group creation validation
const groupCreation = {
  body: Joi.object()
    .keys({
      name: Joi.string(),
      owner_id: uuid.required(),
    })
    .min(2),
};

// participant creation validation
const participantCreation = {
  body: Joi.object()
    .keys({
      user_id: uuid.required(),
      group_id: uuid.required(),
      gift_value: Joi.number().required(),
      role: Joi.string().valid("ADMIN", "USER").optional(),
      status: Joi.string().valid("PENDING", "ACCEPTED", "REJECTED").optional(),
    })
    .min(3),
};

// validate auth config
const validateAuthConfig = {
  body: Joi.object()
    .keys({
      secret: Joi.string().required(),
      expiresIn: Joi.string().required(),
      refresh_secret: Joi.string().required(),
      refresh_expiresIn: Joi.string().required(),
    })
    .min(4),
};


export {
  uuid,
  resourceId,
  userCreation,
  groupCreation,
  participantCreation,
  userLogin,
  validateAuthConfig,
};
