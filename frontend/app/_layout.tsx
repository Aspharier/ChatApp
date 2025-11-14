import { StyleSheet } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/authContext";

const StackLayout = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
};
export default RootLayout;

const styles = StyleSheet.create({});
