import { communityState } from "@/src/atoms/communitiesAtom";
import { Flex, MenuItem, Icon, Box, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { FaReddit } from "react-icons/fa";
import { GrAdd } from "react-icons/gr";
import { useRecoilValue } from "recoil";
import CreateCommunityModal from "../../Modal/CreateCommunity/CreateCommunityModal";
import MenuListItem from "./MenuListItem";

type CommunitiesProps = {};

const Communities: React.FC<CommunitiesProps> = () => {
  const [open, setOpen] = useState(false);
  const mySnippets = useRecoilValue(communityState).mySnippets;

  return (
    <>
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
      <Box mt={3} mb={4}>
        <Text fontSize={"7pt"} color="gray.500" pl={3} mb={1}>
          MODERATING
        </Text>

        {mySnippets.filter(snip => snip.isModerator).map((item) => (
          <MenuListItem
            key={item.communityId}
            icon={FaReddit}
            displayText={`r/${item.communityId}`}
            link={`/r/${item.communityId}`}
            iconColor="blue.500"
            imageURL={item.imageURL}
          />
        ))}
      </Box>

      <Box mt={3} mb={4}>
        <Text fontSize={"7pt"} color="gray.500" pl={3} mb={1}>
          MY COMMUNITIES
        </Text>

        <MenuItem
          fontSize={"10pt"}
          width="100%"
          _hover={{ bg: "gray.100" }}
          onClick={() => {}}
        >
          <Flex align={"center"} onClick={() => setOpen(true)}>
            <Icon as={GrAdd} fontSize="20px" mr={2} />
            Create Community
          </Flex>
        </MenuItem>

        {mySnippets.map((item) => (
          <MenuListItem
            key={item.communityId}
            icon={FaReddit}
            displayText={`r/${item.communityId}`}
            link={`/r/${item.communityId}`}
            iconColor="blue.500"
            imageURL={item.imageURL}
          />
        ))}
      </Box>
    </>
  );
};
export default Communities;
