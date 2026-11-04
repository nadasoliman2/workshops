import mongoose from "mongoose";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, "First name cannot be less than 2 characters"],
      maxLength: 25,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      minLength: [2, "Last name cannot be less than 2 characters"],
      maxLength: 25,
      trim: true,
    },

    email: { type: String, required: true, unique: true, trim: true },
    password: {
      type: String,
      required: function () {
        return this.provider == providerEnum.System;
      },
    },

    phone: String,
    gender: {
      type: Number,
      enum: Object.values(genderEnum),
      default: genderEnum.Male,
    },

    role: {
      type: Number,
      enum: Object.values(roleEnum),
      default: roleEnum.User,
    },
    provider: {
      type: Number,
      enum: Object.values(providerEnum),
      default: providerEnum.System,
    },

    profilePicture: { public_id: String, secure_url: String },
    coverPictures: [{ public_id: String, secure_url: String }],
    // gallary: [String],

    profileVisits: { type: Number, default: 0 },

    confirmEmail: Date,
    changeCredentialsTime: Date,
  },
  {
    collection: "users",
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

export const UserModel = mongoose.model("User", userSchema);
