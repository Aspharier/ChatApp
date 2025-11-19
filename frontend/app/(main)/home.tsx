import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import Button from "@/components/Button";
import { testSocket } from "@/socket/socketEvents";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { router, useRouter } from "expo-router";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";

const Home = () => {
  const { user: currentUser, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const route = useRouter();

  const conversations = [
    {
      name: "Ali",
      type: "direct",
      lastMessage: {
        senderName: "Alice",
        content: "Hey! Are we still on for tonight?",
        createdAt: "2023-06-01T12:00:00.000Z",
      },
    },
    {
      name: "Project Team",
      type: "group",
      lastMessage: {
        senderName: "Sarah",
        content: "Meeting is rescheduled for next week",
        createdAt: "2023-06-01T12:00:00.000Z",
      },
    },
    {
      name: "Sam",
      type: "direct",
      lastMessage: {
        senderName: "Sam",
        content: "Hey What's up?",
        createdAt: "2023-06-01T12:00:00.000Z",
      },
    },
    {
      name: "Family Group",
      type: "group",
      lastMessage: {
        senderName: "Mom",
        content: "Thanks!! for the gift",
        createdAt: "2023-06-01T12:00:00.000Z",
      },
    },
    {
      name: "Ash",
      type: "direct",
      lastMessage: {
        senderName: "Ash",
        content: "Hey I lov U",
        createdAt: "2023-06-01T12:00:00.000Z",
      },
    },
  ];

  let directConversations = conversations
    .filter((item: any) => item.type === "direct")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversations = conversations
    .filter((item: any) => item.type === "group")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome back,{" "}
              <Typo size={20} fontWeight={"800"} color={colors.white}>
                {currentUser?.name}
              </Typo>{" "}
              🤌
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => router.push("/(main)/profileModal")}
          >
            <Icons.GearSixIcon
              color={colors.white}
              weight="fill"
              size={verticalScale(22)}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 0 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 1 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Group</Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.conversationList}>
              {selectedTab == 0 &&
                directConversations.map((item: any, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length != index + 1}
                    />
                  );
                })}
              {selectedTab == 1 &&
                groupConversations.map((item: any, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length != index + 1}
                    />
                  );
                })}
            </View>

            {!loading &&
              selectedTab == 0 &&
              directConversations.length == 0 && (
                <Typo style={{ textAlign: "center" }}>
                  You don't have any messages
                </Typo>
              )}

            {!loading && selectedTab == 1 && groupConversations.length == 0 && (
              <Typo style={{ textAlign: "center" }}>
                You haven't join any groups yet
              </Typo>
            )}
            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>

      <Button
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/(main)/newConversationModal",
            params: { isGroup: selectedTab },
          })
        }
      >
        <Icons.PlusIcon
          color={colors.black}
          weight="bold"
          size={verticalScale(24)}
        />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
