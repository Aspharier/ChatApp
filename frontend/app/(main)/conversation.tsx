import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors } from '@/constants/theme'

const Conversations = () => {
  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Conversations</Typo>
    </ScreenWrapper>
  )
}

export default Conversations

const styles = StyleSheet.create({})