import { Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const NotFound: React.FC = () => {
  return (
    <Flex
      align={"center"}
      justify="center"
      direction={"column"}
      minHeight="60vh"
    >
      Sorry, that community does not exist or has been banned
      <Link href={"/"}>
        <Button mt={4}>GO HOME</Button>
      </Link>
    </Flex>
  );
};
export default NotFound;
