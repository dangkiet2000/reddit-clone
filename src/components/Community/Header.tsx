import { Community } from "@/src/atoms/communitiesAtom";
import { Box, Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React from "react";
import { FaReddit } from "react-icons/fa";
import useCommunityData from "@/src/hooks/useCommunityData";

type HeaderProps = {
  communityData: Community;
};

/*
  * Làm sao biết đc user có join cái community A hay chưa?
    * Mỗi user có cái document communitySnippets (Chứa communityId) => Lấy này so sánh với cái community A.
    * => Mỗi lần user join cái community nào thì phải add thêm 1 cái communitySnippets vô cái user.
  ? Tại sao ko làm cách ngược lại là store array các userId vô community?
    * Ko đc thì 1 community có khi có hàng triệu user join => Cái array đó chứa hàng triệu cái userId luôn
    * Còn làm như cách communitySnippets thì => Mỗi user chỉ có tầm 10-50 cái community thôi. Vì ko có user nào join nhiều community hết.
    * Trung bình 1 user chỉ join tầm 10-50 communities
*/

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  const { communityStateValue, onJoinOrLeaveCommunity, loading } =
    useCommunityData();

  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  ); // Just make it true or false

  // Get communitySnippets of user and store into mySnippets.

  return (
    <Flex direction="column" width="100%" height="146px">
      <Box height={"50%"} bg="blue.400"></Box>
      <Flex justify={"center"} bg={"white"} flexGrow={1}>
        <Flex width={"95%"} maxWidth="860px">
          {communityStateValue.currentCommunity?.imageURL ? (
            <Image
              alt="imageURL"
              src={communityStateValue.currentCommunity?.imageURL}
              borderRadius="full"
              boxSize={"66px"}
              position="relative"
              top={-3}
              color="blue.500"
              border="4px solid white"
            />
          ) : (
            <Icon
              as={FaReddit}
              fontSize="64px"
              position={"relative"}
              top={-3}
              color="blue.500"
              borderRadius={"50%"}
            />
          )}

          <Flex padding={"10px 16px"}>
            <Flex direction={"column"} mr={6}>
              <Text fontWeight={800} fontSize="16pt">
                {communityData.id}
              </Text>
              <Text fontWeight={600} fontSize="10pt" color="gray.400">
                r/{communityData.id}
              </Text>
            </Flex>
            <Button
              variant={isJoined ? "outline" : "solid"}
              height="30px"
              pr={6}
              pl={6}
              isLoading={loading}
              onClick={() => onJoinOrLeaveCommunity(communityData, isJoined)}
            >
              {isJoined ? "Joined" : "Join"}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
export default Header;
