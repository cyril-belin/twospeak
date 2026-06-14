import { useLocalSearchParams } from "expo-router";

import { AudioLessonScreen } from "@/components/lessons/audio-lesson-screen";
import { TabPlaceholderScreen } from "@/components/navigation/tab-placeholder-screen";
import { getAudioLessonScreenData } from "@/data/audio-lesson-screen";

export default function AudioLessonRouteScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const screenData = getAudioLessonScreenData(lessonId);

  if (!screenData) {
    return (
      <TabPlaceholderScreen
        subtitle="This lesson is not available yet."
        title="Lesson not found"
      />
    );
  }

  return <AudioLessonScreen screenData={screenData} />;
}
