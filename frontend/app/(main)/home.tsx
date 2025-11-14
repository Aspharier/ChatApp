import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import Button from "@/components/Button";
import { testSocket } from "@/socket/socketEvents";

const Home = () => {
  const { user } = useAuth();
  //console.log("user: ", user);
  // useEffect(() => {
  //   testSocket(testSocketCallbackHandler);
  //   testSocket(null);

  //   return () => {
  //     testSocket(testSocketCallbackHandler, true);
  //   }
  // }, []);

  // const testSocketCallbackHandler = (data: any) => {
  //   console.log("Got a response from the test socket event: ", data);
  // };
  const { signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
  };
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Home</Typo>
      <Button onPress={handleLogout}>
        <Typo>Logout</Typo>
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
