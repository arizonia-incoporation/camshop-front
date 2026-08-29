import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import WelcomeStep from "../../components/auth/WelcomeTab";
import StepIndicator from "../../components/auth/StepIndicator";
import CampusStep from "../../components/auth/CampusTab";
import HostelStep from "../../components/auth/HostelTab";
import PersonalDetailsStep from "../../components/auth/PersonalDetailsTab";
import PasswordStep from "../../components/auth/PasswordTab";
import AppCalls from "../../utils/network";
import { showToast } from "../../utils/toast";
import { useAuth } from "../../context/AuthContext";

export default function SignupScreen() {
  const navigation = useRouter();
  const { storeUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Fixed typo from setLOading
  const [userData, setUserData] = useState({
    isStudent: null, // Added to track student status globally
    campus: "",
    hostel: "",
    username: "",
    phone: "",
    email: "",
    password: "",
  });

  const totalSteps = 5;

  const handleNext = (data) => {
    const updatedData = { ...userData, ...data };
    setUserData(updatedData);

    // Skip the Hostel step if the user is not a student
    if (currentStep === 2 && updatedData.isStudent === false) {
      setCurrentStep(4);
    } else if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleRegister(updatedData);
    }
  };

  const handleBack = () => {
    // Skip the Hostel step when going backward if the user is not a student
    if (currentStep === 4 && userData.isStudent === false) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async (finalData) => {
    setIsLoading(true);
    try {
      const response = await AppCalls.post(
        "/auth/register",
        finalData || userData,
      );
      storeUser(response.token, response.user);
      showToast(
        "success",
        "Welcome " + response.user.username,
        response.message,
      );
      navigation.push("/home");
    } catch (error) {
      showToast("error", "Sign up error ", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => setCurrentStep(2)} />;
      case 2:
        return (
          <CampusStep data={userData} onNext={handleNext} onBack={handleBack} />
        );
      case 3:
        return (
          <HostelStep data={userData} onNext={handleNext} onBack={handleBack} />
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
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderStep()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    width: "100%", // Added to ensure it takes full width within safeArea constraints
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
});
