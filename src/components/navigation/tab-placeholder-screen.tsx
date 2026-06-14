import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

type TabPlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function TabPlaceholderScreen({
  title,
  subtitle,
}: TabPlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-8">
        <Text className="tabs__placeholder-title text-center">{title}</Text>
        <Text className="tabs__placeholder-subtitle mt-3 text-center">
          {subtitle}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
