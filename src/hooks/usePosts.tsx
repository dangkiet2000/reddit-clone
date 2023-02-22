import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { Post, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";
import React, { useEffect } from "react";
import { communityState } from "../atoms/communitiesAtom";
import { authModalState } from "../atoms/authModalAtom";
import { useRouter } from "next/router";

const usePosts = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;

  const setAuthModalState = useSetRecoilState(authModalState);

  const onVotePost = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation(); // Vì mình set onClick cho nguyên cái postItem, mà 2 nút vote nó nằm trong postItem => Khi click vote thì nó trigger như click vào all postItem và route to singlePage
    if (!user) {
      setAuthModalState((prev) => ({ ...prev, open: true, view: "login" }));
      return; // ! Make sure you have return this function => Its important
    }

    try {
      const { voteStatus } = post;
      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      );

      const batch = writeBatch(firestore);
      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatePostVotes = [...postStateValue.postVotes];
      let voteChange = vote;

      // New vote
      if (!existingVote) {
        // Create a new postValue document.
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote, // 1 or -1
        };

        batch.set(postVoteRef, newVote);

        // add/substract 1 to from the post.voteStatus
        updatedPost.voteStatus = voteStatus + vote;
        updatePostVotes = [...updatePostVotes, newVote];
      }
      // existing vote - they have voted on the post before
      else {
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        );

        // Removing their vote (up => neutral OR down => neutral)
        if (existingVote.voteValue === vote) {
          updatedPost.voteStatus = voteStatus - vote;
          updatePostVotes = updatePostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );

          // delete the postValue document
          batch.delete(postVoteRef);

          voteChange += -1;
        }
        // Flipping their vote (up => down OR down => up)
        else {
          // add/substract 2 to from post.voteStatus
          updatedPost.voteStatus = voteStatus + 2 * vote;

          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          updatePostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          };

          // updating the existing postVote document
          batch.update(postVoteRef, {
            voteValue: vote,
          });

          voteChange = 2 * vote;
        }
      }

      // update state with updated values
      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );
      updatedPosts[postIdx] = updatedPost;

      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatePostVotes,
      }));

      if (postStateValue.selectedPost) {
        setPostStateValue((prev) => ({ ...prev, selectedPost: updatedPost }));
      }

      // Update database
      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });
      await batch.commit();
    } catch (error) {
      console.log("OnVotePost error", error);
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue((prev) => ({ ...prev, selectedPost: post }));

    router.push(`/r/${post.communityId}/comments/${post.id}`);
  };

  // ! delete image and post content.
  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      // check if image, delete if exists
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`);

        await deleteObject(imageRef);
      }

      // delete post from document from firestore
      const postDocRef = doc(firestore, "posts", post.id!); // ! is mean postId is exists
      await deleteDoc(postDocRef);

      // update recoil state
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
      }));

      return true;
    } catch (error) {
      return false;
    }
  };

  const getCommunityPostVote = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );

    const postVoteDocs = await getDocs(postVotesQuery);
    const postVotes = postVoteDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVotes as PostVote[],
    }));
  };

  useEffect(() => {
    if (!user || !currentCommunity?.id) return;
    getCommunityPostVote(currentCommunity?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentCommunity]);

  useEffect(() => {
    if (!user) {
      // Clear user post votes
      setPostStateValue((prev) => ({ ...prev, postVotes: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    postStateValue,
    setPostStateValue,
    onVotePost,
    onDeletePost,
    onSelectPost,
  };
};

export default usePosts;
