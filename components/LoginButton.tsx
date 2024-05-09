"use client"
import React from "react";
import { UserIcon } from "./UserIcon";
import { Button } from './ui/Button';
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

const LoginButton = () => {
  return (
    <LoginLink>
        <button>
          Login
        </button>
    </LoginLink>
  );
};

export default LoginButton;