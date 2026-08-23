import { Slot } from "expo-router";
import { View, Text,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../../../theme/theme";

export default function ProfileLayout() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  }
});