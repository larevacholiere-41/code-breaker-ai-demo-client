import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Modal,
  Input,
  Button,
} from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import { getThemeToken } from "../helpers";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createVsAiGameMutationFn } from "../mutations/games";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

export const HomePage = () => {
  const navigate = useNavigate();
  const themeToken = getThemeToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const createVsAiGameMutation = useMutation({
    mutationFn: createVsAiGameMutationFn,
  });

  const validateSecretCode = (code: string): string => {
    if (code.length === 0) {
      return "";
    }
    if (code.length < 4) {
      return "";
    }
    const digits = code.split("");
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size !== 4) {
      return "All digits must be unique";
    }
    return "";
  };

  const handlePlayerVsAiClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSecretCode("");
    setValidationError("");
  };

  const handleCodeChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
    setSecretCode(cleanedValue);
    setValidationError(validateSecretCode(cleanedValue));
  };

  const handleStartGame = () => {
    // Placeholder function
    console.log("Starting game with secret code:", secretCode);
    createVsAiGameMutation
      .mutateAsync(secretCode)
      .then((gamestate) => {
        navigate(`/game/${gamestate.game_id}`);
      })
      .catch((error) => {
        console.error("Error starting game:", error);
      });
    handleModalClose();
  };

  const isCodeValid = secretCode.length === 4 && validationError === "";

  const handleAiVsAiClick = () => {
    // Placeholder function
    console.log("AI vs AI mode clicked");
  };

  return (
    <Layout style={{ minHeight: "100vh", width: "100%", padding: "2rem" }}>
      <Content style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={1}>Code Breaker AI Demo</Title>
            <Title level={3} style={{ color: themeToken.colorPrimary }}>
              Goal
            </Title>
            <Paragraph>
              Explore how ML models can learn to play simple games through
              interactive gameplay and observation.
            </Paragraph>

            <Title level={3} style={{ color: themeToken.colorPrimary }}>
              Game Rules
            </Title>
            <Paragraph>
              This is a simplified version of the Code Breaker game where the
              goal is to find all digits of a four-digit secret code.
              <br />
              <br />
              <Text>
                • Each guess must contain <strong>4 unique digits (0-9)</strong>
              </Text>
              <br />
              <Text>
                • Feedback for each guess will tell you{" "}
                <strong>how many digits are in the secret code</strong>
              </Text>
              <br />
              <Text>
                • Use the feedback to strategically narrow down the correct
                combination
              </Text>
            </Paragraph>
          </div>

          <Title level={3} style={{ color: themeToken.colorPrimary }}>
            Choose a Game Mode
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={12}>
              <GameModeCard
                title="Player vs AI"
                description={
                  "Compete against the AI! Try to figure out the AI's secret code before it " +
                  "figures out yours. A race against time and strategy."
                }
                icon={
                  <UserOutlined
                    style={{ fontSize: "3rem", color: themeToken.colorPrimary }}
                  />
                }
                onClick={handlePlayerVsAiClick}
              />
            </Col>

            <Col xs={24} sm={24} md={12}>
              <GameModeCard
                title="AI vs AI"
                description={
                  "Observe how AI with more sophisticated instructions compares to AI " +
                  "with minimal instructions. Learn about different AI strategies and approaches."
                }
                icon={
                  <RobotOutlined
                    style={{ fontSize: "3rem", color: themeToken.colorPrimary }}
                  />
                }
                onClick={handleAiVsAiClick}
              />
            </Col>
          </Row>
        </Space>

        <Modal
          title="Enter Your Secret Code"
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          closable={createVsAiGameMutation.isPending}
        >
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Text>Enter a four-digit code (0-9, unique digits):</Text>
              <Input
                value={secretCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="0000"
                maxLength={4}
                status={validationError ? "error" : ""}
                style={{ marginTop: "0.5rem" }}
                onPressEnter={isCodeValid ? handleStartGame : undefined}
              />
              {validationError && (
                <Text
                  type="danger"
                  style={{
                    fontSize: "0.875rem",
                    display: "block",
                    marginTop: "0.25rem",
                  }}
                >
                  {validationError}
                </Text>
              )}
            </div>
            <Button
              type="primary"
              onClick={handleStartGame}
              disabled={!isCodeValid}
              block
            >
              Start Game
            </Button>
          </Space>
        </Modal>
      </Content>
    </Layout>
  );
};

const GameModeCard = ({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  const themeToken = getThemeToken();
  const [isHovered, setIsHovered] = useState(false);

  const backgroundColor = isHovered
    ? themeToken.colorBgElevated
    : themeToken.colorBgContainer;

  return (
    <Card
      hoverable
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: "100%",
        cursor: "pointer",
        border: `2px solid ${themeToken.colorPrimary}`,
        borderRadius: "8px",
        transition: "all 0.3s ease",
        backgroundColor,
      }}
      styles={{ body: { padding: "2rem", textAlign: "center" } }}
    >
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {icon}
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        <Paragraph>{description}</Paragraph>
      </Space>
    </Card>
  );
};
