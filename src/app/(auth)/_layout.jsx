import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/theme";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  innerContainer: {
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    flex: 1,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
});
