import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/context/authContext";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as Icons from "phosphor-react-native";
import MessageItem from "@/components/MessageItem";
import Input from "@/components/Input";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Loading from "@/components/Loading";
import { uploadFileToCloudinary } from "@/services/imageService";
import { getMessages, newMessage } from "@/socket/socketEvents";
import { MessageProps, ResponseProps } from "@/types";

const Conversations = () => {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(
    null
  );
  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();
  // console.log("got conversation data: ", data);

  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = avatar;
  let isDirect = type === "direct";
  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id != currentUser?.id)
    : null;

  if (isDirect && otherParticipant) {
    conversationAvatar = otherParticipant?.avatar;
  }

  let conversationName = isDirect ? otherParticipant.name : name;

  useEffect(() => {
    newMessage(newMessageHandler);
    getMessages(messageHandler);
    getMessages({ conversationId });

    return () => {
      newMessage(newMessageHandler, true);
      getMessages(messageHandler, true);
    };
  }, []);

  const newMessageHandler = (res: ResponseProps) => {
    setLoading(false);
    // console.log("got new message: ", res);
    if (res.success) {
      if (res.data.conversationId == conversationId) {
        setMessages((prev) => [res.data as MessageProps, ...prev]);
      }
    } else {
      Alert.alert("Error", res.msg);
    }
  };

  const messageHandler = (res: ResponseProps) => {
    if (res.success) {
      setMessages(res.data);
    }
  };
  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const onSend = async () => {
    if (!message.trim() && !selectedFile) return;
    if (!currentUser) return;

    setLoading(true);
    try {
      let attachement = null;
      if (selectedFile) {
        const uploadResult = await uploadFileToCloudinary(
          selectedFile,
          "message-attachements"
        );

        if (uploadResult.success) {
          attachement = uploadResult.data;
        } else {
          setLoading(false);
          Alert.alert("Error", "Could not send the image!");
        }
      }
      newMessage({
        conversationId,
        sender: {
          id: currentUser?.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: message.trim(),
        attachement,
      });

      setMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.log("Error sending message: ", error);
      Alert.alert("Error", "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // const dummyMessages = [
  //   {
  //     id: "msg_10",
  //     sender: {
  //       id: "user_2",
  //       name: "Jade smith",
  //       avatar: null,
  //     },
  //     content: "That would be really usefull!",
  //     createdAt: "10:42 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_9",
  //     sender: {
  //       id: "me",
  //       name: "me",
  //       avatar: null,
  //     },
  //     content:
  //       "Yes, I'm thinking about adding message reactions and file sharing.",
  //     createdAt: "10:41 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_8",
  //     sender: {
  //       id: "user_2",
  //       name: "Jade smith",
  //       avatar: null,
  //     },
  //     content:
  //       "Oh nice! Message reactions would make the chat feel more alive.",
  //     createdAt: "10:40 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_7",
  //     sender: {
  //       id: "me",
  //       name: "me",
  //       avatar: null,
  //     },
  //     content: "Exactly! I also want to add typing indicators.",
  //     createdAt: "10:39 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_6",
  //     sender: {
  //       id: "user_2",
  //       name: "Jade smith",
  //       avatar: null,
  //     },
  //     content: "Typing indicators make conversations feel more real.",
  //     createdAt: "10:38 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_5",
  //     sender: {
  //       id: "me",
  //       name: "me",
  //       avatar: null,
  //     },
  //     content: "True! I'm also planning to add dark mode soon.",
  //     createdAt: "10:37 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_4",
  //     sender: {
  //       id: "user_2",
  //       name: "Jade smith",
  //       avatar: null,
  //     },
  //     content: "Dark mode is a must-have. Excited for that!",
  //     createdAt: "10:36 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_3",
  //     sender: {
  //       id: "me",
  //       name: "me",
  //       avatar: null,
  //     },
  //     content: "Glad you like it! Trying to make the UI as clean as possible.",
  //     createdAt: "10:35 AM",
  //     isMe: true,
  //   },
  //   {
  //     id: "msg_2",
  //     sender: {
  //       id: "user_2",
  //       name: "Jade smith",
  //       avatar: null,
  //     },
  //     content: "You're doing a great job honestly.",
  //     createdAt: "10:34 AM",
  //     isMe: false,
  //   },
  //   {
  //     id: "msg_1",
  //     sender: {
  //       id: "me",
  //       name: "me",
  //       avatar: null,
  //     },
  //     content: "Thanks a lot Jade!",
  //     createdAt: "10:33 AM",
  //     isMe: true,
  //   },
  // ];

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type === "group"}
              />
              <Typo fontWeight={"500"} size={22} color={colors.white}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity style={{ marginBottom: verticalScale(7) }}>
              <Icons.DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />
        {/* Messages */}
        <View style={styles.content}>
          <FlatList
            data={messages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messageContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
          />
          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <Icons.PlusIcon
                    color={colors.black}
                    weight="bold"
                    size={verticalScale(22)}
                  />
                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={selectedFile.uri}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />
            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                {loading ? (
                  <Loading size="small" color={colors.black} />
                ) : (
                  <Icons.PaperPlaneTiltIcon
                    color={colors.black}
                    weight="fill"
                    size={verticalScale(22)}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 0,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
  messageContent: {
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
  messageContainer: {
    flex: 1,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
});
