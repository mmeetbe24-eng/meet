export function speak(text: string, language: string = "en") {
  if (typeof window === "undefined") return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // no-op
  }
}

