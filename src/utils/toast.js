import { SuccessToast, ErrorToast } from "react-native-toast-message";
import Toast from "react-native-toast-message";
import { colors } from '../theme/theme';

export const toastConfig = {
  success: (props) => (
    <SuccessToast
      {...props}
      style={{
        borderLeftColor: colors.lime,
        backgroundColor: colors.limeLight,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: "bold", color: colors.success }}
      text2Style={{ fontSize: 13, color: colors.limeDeep }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: colors.lime, backgroundColor: "#ffebee" }}
      text1Style={{ fontSize: 15, fontWeight: "bold", color: "#c62828" }}
      text2Style={{ fontSize: 13, color: colors.danger }}
    />
  ),
  // You can also define a custom 'info' type here
};

export const showToast = (type,text1,text2) => {
  Toast.show({
    type, // 'success', 'error', or 'info'
    text1,
    text2,
    position: "top",
    visibilityTime: 5000,
    topOffset: 70,
  });
};

