import {
  Layout,
  Typography,
  Card,
  Space,
  Input,
  Button,
  Tag,
  Alert,
  Spin,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  RobotOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { getThemeToken } from "../helpers";
import { useParams } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import { useState } from "react";
import type { Guess } from "../types/gameApi";
import { makeGuessMutationFn } from "../mutations/games";
import { useMutation } from "@tanstack/react-query";

const { Title, Text } = Typography;
const { Content } = Layout;

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const themeToken = getThemeToken();
  const { gameState, error } = useGameState(gameId || "");
  const [guessInput, setGuessInput] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(
    new Set()
  );
  const makeGuessMutation = useMutation({
    mutationFn: (guess: string) => makeGuessMutationFn(gameId || "", guess),
  });

  const validateGuess = (code: string): string => {
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

  const handleGuessChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "").slice(0, 4);
    setGuessInput(cleanedValue);
    setValidationError(validateGuess(cleanedValue));
  };

  const handleSubmitGuess = () => {
    // Placeholder handler
    console.log("Submitting guess:", guessInput);
    // TODO: Implement actual API call to submit guess
    makeGuessMutation.mutateAsync(guessInput).catch((error) => {
      console.error("Error submitting guess:", error);
    });
    setGuessInput("");
    setValidationError("");
  };

  const handleToggleReasoning = (index: number) => {
    setExpandedReasoning((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isGuessValid = guessInput.length === 4 && validationError === "";

  if (!gameId) {
    return (
      <Layout style={{ minHeight: "100vh", width: "100%", padding: "2rem" }}>
        <Content style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Alert title="Error" description="Game ID is missing" type="error" />
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: "100vh", width: "100%", padding: "2rem" }}>
        <Content style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Alert title="Error" description={error} type="error" />
        </Content>
      </Layout>
    );
  }

  if (!gameState) {
    return (
      <Layout style={{ minHeight: "100vh", width: "100%", padding: "2rem" }}>
        <Content style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Spin
            size="large"
            style={{ display: "block", textAlign: "center", marginTop: "2rem" }}
          />
        </Content>
      </Layout>
    );
  }

  const isPlayer1Turn = gameState.waiting_for_player === "player_1";
  const isGameCompleted = gameState.status === "completed";

  // Group guesses into rounds and reverse order
  const groupGuessesIntoRounds = (history: Guess[]) => {
    const rounds: Array<{ player1?: Guess; player2?: Guess }> = [];

    // Group guesses into rounds in chronological order
    for (let i = 0; i < history.length; i++) {
      const guess = history[i];
      if (guess.player === "player_1") {
        // Start a new round with player 1
        rounds.push({ player1: guess });
      } else {
        // Add player 2 to the last round, or create new round if none exists
        if (rounds.length === 0 || rounds[rounds.length - 1].player2) {
          rounds.push({ player2: guess });
        } else {
          rounds[rounds.length - 1].player2 = guess;
        }
      }
    }

    // Reverse rounds to show newest first
    return rounds.reverse();
  };

  const rounds = groupGuessesIntoRounds(gameState.history);

  return (
    <Layout style={{ minHeight: "100vh", width: "100%", padding: "2rem" }}>
      <Content style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={1}>Game #{gameState.game_id}</Title>
            <Space>
              <Tag color={gameState.status === "completed" ? "green" : "blue"}>
                {gameState.status === "completed" ? "Completed" : "In Progress"}
              </Tag>
              {gameState.winner && (
                <Tag color="gold">
                  Winner: {gameState.winner === "player_1" ? "You" : "AI"}
                </Tag>
              )}
              {!isGameCompleted && (
                <Tag color={isPlayer1Turn ? "green" : "orange"}>
                  {isPlayer1Turn ? "Your Turn" : "AI's Turn"}
                </Tag>
              )}
            </Space>
          </div>

          <Card title="Submit Guess" style={{ width: "100%" }}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                value={guessInput}
                onChange={(e) => handleGuessChange(e.target.value)}
                placeholder="Enter 4 unique digits (0-9)"
                maxLength={4}
                status={validationError ? "error" : ""}
                disabled={!isPlayer1Turn || isGameCompleted}
                style={{ flex: 1 }}
                onPressEnter={
                  isGuessValid && isPlayer1Turn && !isGameCompleted
                    ? handleSubmitGuess
                    : undefined
                }
              />
              <Button
                type="primary"
                onClick={handleSubmitGuess}
                disabled={!isGuessValid || !isPlayer1Turn || isGameCompleted}
              >
                Submit Guess
              </Button>
            </Space.Compact>
            {validationError && (
              <Text
                type="danger"
                style={{
                  fontSize: "0.875rem",
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                {validationError}
              </Text>
            )}
            {!isPlayer1Turn && !isGameCompleted && (
              <Text
                type="secondary"
                style={{
                  fontSize: "0.875rem",
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Waiting for AI to make a move...
              </Text>
            )}
          </Card>

          <Card title="Game History" style={{ width: "100%" }}>
            {rounds.length === 0 ? (
              <Text type="secondary">
                No guesses yet. Make your first guess!
              </Text>
            ) : (
              <Space
                orientation="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {rounds.map((round, roundIndex) => {
                  const originalPlayer2Index = round.player2
                    ? gameState.history.findIndex((g) => g === round.player2)
                    : -1;

                  return (
                    <div key={roundIndex}>
                      <Row gutter={[24, 16]}>
                        <Col xs={24} sm={12}>
                          {round.player1 ? (
                            <Space
                              orientation="vertical"
                              style={{ width: "100%" }}
                            >
                              <Space>
                                <UserOutlined
                                  style={{ color: themeToken.colorPrimary }}
                                />
                                <Text strong>You</Text>
                                <Text>guessed:</Text>
                                <Text code style={{ fontSize: "1.2rem" }}>
                                  {round.player1.code}
                                </Text>
                              </Space>
                              <div>
                                <Text>Feedback: </Text>
                                <Tag color="blue">{round.player1.feedback}</Tag>
                              </div>
                            </Space>
                          ) : (
                            <Text type="secondary">
                              Waiting for your guess...
                            </Text>
                          )}
                        </Col>
                        <Col xs={24} sm={12}>
                          {round.player2 ? (
                            <Space
                              orientation="vertical"
                              style={{ width: "100%" }}
                            >
                              <Space>
                                <RobotOutlined
                                  style={{ color: themeToken.colorSuccess }}
                                />
                                <Text strong>AI</Text>
                                <Text>guessed:</Text>
                                <Text code style={{ fontSize: "1.2rem" }}>
                                  {round.player2.code}
                                </Text>
                              </Space>
                              <div>
                                <Text>Feedback: </Text>
                                <Tag color="blue">{round.player2.feedback}</Tag>
                              </div>
                              {round.player2.comments && (
                                <div>
                                  <Button
                                    type="link"
                                    icon={<CommentOutlined />}
                                    onClick={() =>
                                      handleToggleReasoning(
                                        originalPlayer2Index
                                      )
                                    }
                                    style={{ padding: 0, fontSize: "0.875rem" }}
                                  >
                                    {expandedReasoning.has(originalPlayer2Index)
                                      ? "Hide"
                                      : "View"}{" "}
                                    AI Reasoning
                                  </Button>
                                  {expandedReasoning.has(
                                    originalPlayer2Index
                                  ) && (
                                    <div
                                      style={{
                                        marginTop: "0.5rem",
                                        padding: "1rem",
                                        backgroundColor:
                                          themeToken.colorBgContainer,
                                        borderRadius: "4px",
                                        whiteSpace: "pre-wrap",
                                        fontSize: "0.875rem",
                                      }}
                                    >
                                      {round.player2.comments}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Space>
                          ) : (
                            <Text type="secondary">
                              Waiting for AI guess...
                            </Text>
                          )}
                        </Col>
                      </Row>
                      {roundIndex < rounds.length - 1 && (
                        <Divider style={{ margin: "1rem 0" }} />
                      )}
                    </div>
                  );
                })}
              </Space>
            )}
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};
