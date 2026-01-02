import { Modal, Typography, Space } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface GameEndModalProps {
  open: boolean;
  onClose: () => void;
  winner: "player_1" | "player_2" | null;
  isAiVsAiMode?: boolean;
}

export const GameEndModal = ({
  open,
  onClose,
  winner,
  isAiVsAiMode = false,
}: GameEndModalProps) => {
  const winnerName = isAiVsAiMode
    ? winner === "player_1"
      ? "AI Player 1"
      : "AI Player 2"
    : winner === "player_1"
    ? "You"
    : "AI";

  return (
    <Modal
      title={
        <Space>
          <TrophyOutlined style={{ color: "#ffd700" }} />
          <span>Game Ended</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      centered
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Text style={{ fontSize: "1rem" }}>The game has ended.</Text>
        {winner ? (
          <div>
            <Text style={{ fontSize: "1rem" }}>
              Winner: <strong>{winnerName}</strong>
            </Text>
            {!isAiVsAiMode && winner === "player_1" && (
              <div style={{ marginTop: "1rem" }}>
                <Title level={4} style={{ margin: 0, color: "#64ffda" }}>
                  🎉 Congratulations! 🎉
                </Title>
                <Text
                  style={{
                    fontSize: "0.95rem",
                    display: "block",
                    marginTop: "0.5rem",
                  }}
                >
                  You've successfully outsmarted the AI!
                </Text>
              </div>
            )}
            {isAiVsAiMode && (
              <div style={{ marginTop: "1rem" }}>
                <Text
                  style={{
                    fontSize: "0.95rem",
                    display: "block",
                    marginTop: "0.5rem",
                  }}
                >
                  {winnerName} successfully figured out the secret code first!
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Text style={{ fontSize: "1rem" }}>
            The game ended without a winner.
          </Text>
        )}
      </Space>
    </Modal>
  );
};
