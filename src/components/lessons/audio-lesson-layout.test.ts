import { getAudioLessonPreviewHeight } from "./audio-lesson-layout";

const compactHeight = getAudioLessonPreviewHeight({
  availableHeight: 719,
  contentWidth: 365,
});

if (compactHeight > 399) {
  throw new Error(
    "Audio lesson preview should leave room for controls and feedback on compact screens.",
  );
}

const tallHeight = getAudioLessonPreviewHeight({
  availableHeight: 839,
  contentWidth: 402,
});

if (tallHeight < 460) {
  throw new Error(
    "Audio lesson preview should keep the teacher area generous on taller screens.",
  );
}

const narrowHeight = getAudioLessonPreviewHeight({
  availableHeight: 647,
  contentWidth: 320,
});

if (narrowHeight < 320 || narrowHeight > 327) {
  throw new Error(
    "Audio lesson preview should stay visible without pushing feedback off small screens.",
  );
}
