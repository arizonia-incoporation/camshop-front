import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import WelcomeStep from "../../components/auth/WelcomeTab";
import StepIndicator from "../../components/auth/StepIndicator";
import CampusStep from "../../components/auth/CampusTab";
import HostelStep from "../../components/auth/HostelTab";
import PersonalDetailsStep from "../../components/auth/PersonalDetailsTab";
import PasswordStep from "../../components/auth/PasswordTab";
import AppCalls from "../../utils/network";
import { showToast } from '../../utils/toast';
import { useAuth } from "../../context/AuthContext";

export default function SignupScreen() {
  const navigation = useRouter()
  const { storeUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setLOading] = useState(false);
  const [userData, setUserData] = useState({
    campus: "",
    hostel: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const totalSteps = 5;

  const handleNext = (data) => {
    setUserData({ ...userData, ...data });
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRegister()
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async (data) => {
    setLOading(true)
    data = { ...userData, ...data }
    try {
      const response = await AppCalls.post(
        "/auth/register",
        data
      );
      storeUser(response.token, response.user);
      showToast("success", "Welcome " + response.user.username, response.message);
      navigation.push("/home");
    } catch (error) {
      showToast("error", "Sign up error ", error.message);
    } finally {
      setLOading(false);
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => setCurrentStep(2)} />;
      case 2:
        return (
          <CampusStep
            data={userData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <HostelStep
            data={userData}
            onNext={handleNext}
            onBack={handleBack} 
          />
        );
      case 4:
        return (
          <PersonalDetailsStep
            data={userData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <PasswordStep
            data={userData}
            onNext={handleRegister}
            onBack={handleBack}
            loading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStep()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // make it take the full height of the screen and center the content vertically
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "center",
    height: "", },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
});
