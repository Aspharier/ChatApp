import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'
import { useLocalSearchParams } from 'expo-router'

const Conversations = () => {

  const data = useLocalSearchParams();
  // console.log("got conversation data: ", data);
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Conversations</Typo>
    </ScreenWrapper>
  )
}

export default Conversations

const styles = StyleSheet.create({})