const fixedAudioLessonVerticalSpace = 378;
const minimumPreviewHeight = 320;
const minimumPreferredPreviewHeight = 360;
const preferredPreviewRatio = 1.16;

type AudioLessonPreviewHeightInput = {
  availableHeight: number;
  contentWidth: number;
};

export function getAudioLessonPreviewHeight({
  availableHeight,
  contentWidth,
}: AudioLessonPreviewHeightInput) {
  const preferredHeight = Math.max(
    contentWidth * preferredPreviewRatio,
    minimumPreferredPreviewHeight,
  );
  const maximumHeight = Math.max(
    availableHeight - fixedAudioLessonVerticalSpace,
    minimumPreviewHeight,
  );

  return Math.min(preferredHeight, maximumHeight);
}
