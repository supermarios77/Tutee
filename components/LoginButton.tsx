"use client"
import React from "react";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@nextui-org/react";
import { UserIcon } from "./icons/UserIcon";

const LoginButton = () => {
  return (
    <LoginLink>
      <Button isIconOnly color="primary" aria-label="Login">
        <UserIcon filled={undefined} size={undefined} height={undefined} width={undefined} label={undefined} />
      </Button> 
    </LoginLink>
  );
};

export default LoginButton;