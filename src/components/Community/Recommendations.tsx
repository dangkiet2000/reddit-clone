import { Community } from "@/src/atoms/communitiesAtom";
import { firestore } from "@/src/firebase/clientApp";
import useCommunityData from "@/src/hooks/useCommunityData";
import {
  Box,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Icon,
  Button,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import React, { useState } from "react";
import { FaReddit } from "react-icons/fa";

const Recommendations: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();

  const getCommunityCommendations = async () => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc"),
        limit(5)
      );

      const communityDocs = await getDocs(communityQuery);

      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCommunities(communities as Community[]);
    } catch (error) {
      console.log("getCommunityCommendation error", error);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    getCommunityCommendations();
  }, []);

  return (
    <Box width="full">
      <Flex
        direction={"column"}
        border="1px solid"
        borderColor="gray.300"
        bg="white"
        borderRadius={4}
      >
        <Flex
          align="center"
          color="white"
          p="6px 10px"
          height={"70px"}
          borderRadius="4px 4px 0px 0px"
          fontWeight={700}
          bgImage="url(/images/recCommsArt.png)"
          backgroundSize={"cover"}
          bgGradient="linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75)),
            url('images/recCommsArt.png')"
        >
          Top Communities
        </Flex>

        <Flex direction="column">
          {loading ? (
            <Stack mt={2} p={3}>
              <Flex justify="space-between" align="center">
                <SkeletonCircle size="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
              <Flex justify="space-between" align="center">
                <SkeletonCircle size="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
              <Flex justify="space-between" align="center">
                <SkeletonCircle size="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
            </Stack>
          ) : (
            <>
              {communities.map((item, index) => {
                const isJoined = !!communityStateValue.mySnippets.find(
                  (snippet) => snippet.communityId === item.id
                );

                return (
                  <Link key={item.id} href={`/r/${item.id}`}>
                    <Flex
                      position={"relative"}
                      align="center"
                      fontSize={"10pt"}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                      p="10px 12px"
                    >
                      <Flex width="80%" align="center">
                        <Flex width="15%">
                          <Text>{index + 1}</Text>
                        </Flex>

                        <Flex align={"center"} width="80%">
                          {item.imageURL ? (
                            <Image
                              alt="communityImage"
                              src={item.imageURL}
                              borderRadius="full"
                              boxSize="28px"
                              mr={2}
                            />
                          ) : (
                            <Icon
                              as={FaReddit}
                              fontSize="30px"
                              color="brand.100"
                              mr={2}
                            />
                          )}
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {`r/${item.id}`}
                          </span>
                        </Flex>
                      </Flex>

                      <Box position="absolute" right="10px">
                        <Button
                          height={"22px"}
                          fontSize="8pt"
                          variant={isJoined ? "outline" : "solid"}
                          onClick={(event) => {
                            event.preventDefault();
                            onJoinOrLeaveCommunity(item, isJoined);
                          }}
                        >
                          {isJoined ? "Joined" : "Join"}
                        </Button>
                      </Box>
                    </Flex>
                  </Link>
                );
              })}

              <Box p="10px 20px">
                <Button height="30px" width="100%">
                  View All
                </Button>
              </Box>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Recommendations;
