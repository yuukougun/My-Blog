type MessageBlockProps = {
  variant?: "info" | "warn" | "alert";
  children: React.ReactNode;
};

export default function MessageBlock({ variant = "info", children }: MessageBlockProps) {
  return <div className={`message-block message-${variant}`}>{children}</div>;
}
