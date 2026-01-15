import React from "react";

const MoodSessionEmoji = ({ mood, sessionCount, totalSessions, theme }) => {
  let emoji = "😊";
  let label = "Good!";
  let color = "text-green-600";
  let bgColor = "bg-green-50";
  let description = "Your mood looks great!";

  if (theme === "dark") {
    bgColor = "bg-green-900/20";
  }

  // GOOD MOOD (7+) - Show BEST emojis
  if (mood >= 7) {
    const bestEmojis = [
      { emoji: "🌟", label: "Excellent!", description: "You're doing amazing today!" },
      { emoji: "🎉", label: "Fantastic!", description: "Your mood is wonderful!" },
      { emoji: "✨", label: "Brilliant!", description: "Keep this energy going!" },
      { emoji: "🚀", label: "Thriving!", description: "You're at your best!" },
      { emoji: "💫", label: "Outstanding!", description: "What a positive day!" }
    ];
    const random = bestEmojis[Math.floor(Math.random() * bestEmojis.length)];
    emoji = random.emoji;
    label = random.label;
    description = random.description;
    color = "text-yellow-600";
    bgColor = theme === "dark" ? "bg-yellow-900/20" : "bg-yellow-50";
  }
  // AVERAGE MOOD (5-6) - Show neutral emojis
  else if (mood >= 5) {
    emoji = "😊";
    label = "Okay";
    description = "You're managing well";
    color = "text-blue-600";
    bgColor = theme === "dark" ? "bg-blue-900/20" : "bg-blue-50";
  }
  // BAD MOOD (<5) - Show BAD emojis
  else {
    const badEmojis = [
      { emoji: "😢", label: "Struggling", description: "You might need extra support today" },
      { emoji: "😟", label: "Worried", description: "Talk to someone if you need help" },
      { emoji: "😔", label: "Down", description: "It's okay to feel this way" },
      { emoji: "😞", label: "Sad", description: "Your therapy sessions can help" }
    ];
    const random = badEmojis[Math.floor(Math.random() * badEmojis.length)];
    emoji = random.emoji;
    label = random.label;
    description = random.description;
    color = "text-red-600";
    bgColor = theme === "dark" ? "bg-red-900/20" : "bg-red-50";
  }

  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 hover:shadow-xl`}>
      <div className="flex items-center gap-4">
        <div className="text-6xl animate-bounce">{emoji}</div>
        <div className="flex-1">
          <p className={`font-bold text-xl ${color}`}>{label}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-semibold">{description}</span>
          </p>
          <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} font-medium`}>
            Current Mood: <span className={`font-bold ${color}`}>{mood}/10</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodSessionEmoji;
