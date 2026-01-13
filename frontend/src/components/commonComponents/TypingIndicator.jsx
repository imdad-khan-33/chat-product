import botIcon from "../../assets/images/bot.png";

const TypingIndicator = () => {
  return (
    <div className="flex justify-start my-4 gap-3">
      <img src={botIcon} alt="bot" className="w-10 h-10 self-end" />
      <div className="bg-[#058B74] text-white p-4 rounded-[20px] rounded-bl-none w-16">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
