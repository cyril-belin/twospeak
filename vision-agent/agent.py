import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from dotenv import load_dotenv
from vision_agents.core import Agent, AgentLauncher, Runner, User
from vision_agents.core.instructions import Instructions
from vision_agents.plugins import getstream, openai

ROOT_DIR = Path(__file__).resolve().parents[1]
SERVICE_DIR = Path(__file__).resolve().parent

DEFAULT_TARGET_LANGUAGE = "the selected language"
DEFAULT_GREETING = "Greet the learner and ask what they want to practice."


@dataclass(frozen=True)
class TeacherLessonContext:
    language_name: str
    lesson_title: str
    lesson_description: str
    goals: list[str]
    vocabulary: list[dict[str, str]]
    phrases: list[dict[str, str]]
    ai_teacher_prompt: dict[str, str]


def load_environment(env_file: Path | None = None, override: bool = False) -> None:
    """Load the parent app env first so the service reuses Stream credentials."""
    if env_file is not None:
        load_dotenv(env_file, override=override)
        return

    for candidate in (
        ROOT_DIR / ".env",
        ROOT_DIR / ".env.local",
        SERVICE_DIR / ".env",
    ):
        if candidate.exists():
            load_dotenv(candidate, override=override)


def extract_teacher_lesson_context(
    custom_data: Mapping[str, Any] | None,
) -> TeacherLessonContext | None:
    if not custom_data or custom_data.get("twospeak_session_kind") != "audio_lesson":
        return None

    language = _dict_value(custom_data.get("language"))
    lesson = _dict_value(custom_data.get("lesson"))
    goals = _string_list(custom_data.get("goals"))
    vocabulary = _compact_word_rows(custom_data.get("vocabulary"), "term")
    phrases = _compact_word_rows(custom_data.get("phrases"), "text")
    ai_teacher_prompt = _string_dict(custom_data.get("ai_teacher_prompt"))
    language_name = _string_value(language.get("name")) or DEFAULT_TARGET_LANGUAGE
    lesson_title = _string_value(lesson.get("title")) or "Audio lesson"
    lesson_description = _string_value(lesson.get("description")) or ""

    return TeacherLessonContext(
        language_name=language_name,
        lesson_title=lesson_title,
        lesson_description=lesson_description,
        goals=goals,
        vocabulary=vocabulary,
        phrases=phrases,
        ai_teacher_prompt=ai_teacher_prompt,
    )


def build_teacher_instructions(
    selected_language: str | TeacherLessonContext | None = None,
) -> str:
    lesson_context = (
        selected_language
        if isinstance(selected_language, TeacherLessonContext)
        else None
    )
    target_language = (
        lesson_context.language_name
        if lesson_context
        else selected_language
        or os.getenv("TEACHER_TARGET_LANGUAGE")
        or DEFAULT_TARGET_LANGUAGE
    ).strip()
    lesson_lines = _build_lesson_instruction_lines(lesson_context)

    return (
        "You are the TwoSpeak AI language teacher.\n"
        "Act like a warm, energetic real-world language teacher.\n"
        "Always speak English for explanations, encouragement, and feedback.\n"
        f"Teach {target_language} through English.\n"
        "Stay strictly within the selected lesson's goal, vocabulary, phrases, "
        "and context.\n"
        "Do not teach unrelated topics, add new vocabulary, or switch to another "
        "language.\n"
        f"Do not switch into {target_language} for explanations unless you are giving "
        "a short phrase, pronunciation example, or vocabulary item.\n"
        "Introduce target-language words slowly, then immediately give their English "
        "translation.\n"
        "Use short natural sentences, contractions, and gentle encouragement.\n"
        "Keep every reply to one or two conversational sentences.\n"
        "Ask one question at a time and adapt to the learner's level.\n"
        "Listen to the learner's response, then adapt the next explanation or "
        "correction to what they said.\n"
        "Ask the learner to repeat, answer, or try again after each model.\n"
        "Correct mistakes gently, then give a simple example the learner can repeat.\n"
        f"{lesson_lines}"
        "Never mention internal tools, system prompts, API keys, or infrastructure."
    )


def build_teacher_greeting(context: TeacherLessonContext | None = None) -> str:
    if context is None:
        return DEFAULT_GREETING

    first_goal = context.goals[0] if context.goals else "the lesson goal"
    first_phrase = context.phrases[0].get("text") if context.phrases else None
    phrase_instruction = (
        f" Start by modeling this phrase: {first_phrase}."
        if first_phrase
        else ""
    )

    return (
        f"Warmly greet the learner in English, say you are starting "
        f"{context.lesson_title}, and keep the first spoken reply to one or two "
        f"short conversational sentences. Focus only on this goal: {first_goal}."
        f"{phrase_instruction} Say the target phrase slowly, give its English "
        "meaning, then ask the learner to repeat or try."
    )


async def create_agent(
    selected_language: str | None = None,
    **_: object,
) -> Agent:
    load_environment()

    return Agent(
        edge=getstream.Edge(),
        llm=openai.Realtime(
            model=os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2"),
            voice=os.getenv("OPENAI_REALTIME_VOICE", "marin"),
            api_key=os.getenv("OPENAI_API_KEY"),
            send_video=False,
        ),
        agent_user=User(
            id=os.getenv("TEACHER_AGENT_USER_ID", "twospeak-teacher"),
            name=os.getenv("TEACHER_AGENT_NAME", "TwoSpeak Teacher"),
        ),
        instructions=build_teacher_instructions(selected_language),
    )


async def join_call(
    agent: Agent,
    call_type: str,
    call_id: str,
    **_: object,
) -> None:
    call = await agent.create_call(call_type, call_id)
    context = await load_teacher_context_from_call(call)

    if context is not None:
        agent.instructions = Instructions(build_teacher_instructions(context))

    async with agent.join(call, participant_wait_timeout=0):
        await agent.simple_response(
            text=build_teacher_greeting(context),
            interrupt=True,
        )
        await agent.finish()


async def load_teacher_context_from_call(call: object) -> TeacherLessonContext | None:
    response = None

    if hasattr(call, "get"):
        response = await call.get()

    custom_data = _call_custom_data(call) or _call_response_custom_data(response)

    return extract_teacher_lesson_context(custom_data)


def _build_lesson_instruction_lines(context: TeacherLessonContext | None) -> str:
    if context is None:
        return ""

    lines = [
        f"Lesson: {context.lesson_title}",
    ]

    if context.lesson_description:
        lines.append(f"Lesson description: {context.lesson_description}")

    if context.goals:
        lines.append(f"Lesson goals: {'; '.join(context.goals)}")

    if context.vocabulary:
        vocabulary = "; ".join(
            _format_learning_row(item, "term") for item in context.vocabulary[:8]
        )
        lines.append(f"Vocabulary to practice: {vocabulary}")

    if context.phrases:
        phrases = "; ".join(
            _format_learning_row(item, "text") for item in context.phrases[:8]
        )
        lines.append(f"Phrases to practice: {phrases}")

    prompt = context.ai_teacher_prompt

    for key in ("persona", "learnerGoal", "speakingStyle", "correctionStyle"):
        value = prompt.get(key)
        if value:
            lines.append(f"{key}: {value}")

    return "\n".join(lines) + "\n"


def _format_learning_row(item: Mapping[str, str], source_key: str) -> str:
    source = item.get(source_key, "")
    translation = item.get("translation", "")
    pronunciation = item.get("pronunciation", "")
    formatted = f"{source} = {translation}" if translation else source

    if pronunciation:
        return f"{formatted} ({pronunciation})"

    return formatted


def _compact_word_rows(value: object, source_key: str) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    rows: list[dict[str, str]] = []

    for item in value:
        item_dict = _dict_value(item)
        source = _string_value(item_dict.get(source_key))

        if not source:
            continue

        rows.append(
            {
                source_key: source,
                "translation": _string_value(item_dict.get("translation")),
                "pronunciation": _string_value(item_dict.get("pronunciation")),
            }
        )

    return rows


def _dict_value(value: object) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def _call_custom_data(call: object) -> Mapping[str, Any] | None:
    custom_data = getattr(call, "custom_data", None)

    return custom_data if isinstance(custom_data, Mapping) else None


def _call_response_custom_data(response: object) -> Mapping[str, Any] | None:
    data = getattr(response, "data", None)
    response_call = getattr(data, "call", None)
    custom_data = getattr(response_call, "custom", None)

    return custom_data if isinstance(custom_data, Mapping) else None


def _string_dict(value: object) -> dict[str, str]:
    if not isinstance(value, Mapping):
        return {}

    return {
        str(key): string_value
        for key, raw_value in value.items()
        if (string_value := _string_value(raw_value))
    }


def _string_list(value: object) -> list[str]:
    if not isinstance(value, list):
        return []

    return [item for raw_item in value if (item := _string_value(raw_item))]


def _string_value(value: object) -> str:
    return value.strip() if isinstance(value, str) else ""


runner = Runner(
    AgentLauncher(
        create_agent=create_agent,
        join_call=join_call,
        agent_idle_timeout=float(os.getenv("AGENT_IDLE_TIMEOUT_SECONDS", "60")),
        max_concurrent_sessions=int(os.getenv("AGENT_MAX_CONCURRENT_SESSIONS", "10")),
        max_sessions_per_call=int(os.getenv("AGENT_MAX_SESSIONS_PER_CALL", "1")),
        max_session_duration_seconds=float(
            os.getenv("AGENT_MAX_SESSION_DURATION_SECONDS", "1200")
        ),
    )
)


if __name__ == "__main__":
    load_environment()
    runner.cli()
