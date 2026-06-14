import { useLocalSearchParams } from "expo-router";

import { LessonDetailScreen } from "@/components/lessons/lesson-detail-screen";
import { TabPlaceholderScreen } from "@/components/navigation/tab-placeholder-screen";
import { getLesson } from "@/data";

export default function LessonRouteScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLesson(lessonId);

  if (!lesson) {
    return (
      <TabPlaceholderScreen
        subtitle="This lesson is not available yet."
        title="Lesson not found"
      />
    );
  }

  return <LessonDetailScreen lesson={lesson} />;
}
