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
  message,
} from "antd";
import {
  UserOutlined,
  RobotOutlined,
  CommentOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { getThemeToken } from "../helpers";
import { useParams, useNavigate } from "react-router-dom";
import { useGameState } from "../hooks/useGameState";
import { useState, useEffect, useRef } from "react";
import type { Guess } from "../types/gameApi";
import { makeGuessMutationFn } from "../mutations/games";
import { useMutation } from "@tanstack/react-query";
import { GameEndModal } from "../components/GameEndModal";

const { Title, Text } = Typography;
const { Content } = Layout;

export const GamePage = () => {
  const { gameId, mode } = useParams<{ gameId: string; mode?: string }>();
  const navigate = useNavigate();
  const themeToken = getThemeToken();
  const { gameState, error } = useGameState(gameId || "");
  const [guessInput, setGuessInput] = useState("");
  const [validationError, setValidationError] = useState<string>("");
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(
    new Set()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevStatus = useRef<string | null>(null);
  const makeGuessMutation = useMutation({
    mutationFn: (guess: string) => makeGuessMutationFn(gameId || "", guess),
  });

  // Determine game mode (default to player-vs-ai)
  const gameMode = mode || "player-vs-ai";
  const isAiVsAiMode = gameMode === "ai-vs-ai";

  // Show modal once when game status changes to "completed"
  useEffect(() => {
    if (
      gameState?.status === "completed" &&
      prevStatus.current &&
      prevStatus.current !== "completed"
    ) {
      setIsModalOpen(true);
    }
    prevStatus.current = gameState?.status ?? null;
  }, [gameState?.status]);

  const handleCopyGameId = async () => {
    if (gameId) {
      try {
        await navigator.clipboard.writeText(gameId);
        message.success("Game ID copied to clipboard!");
      } catch (err) {
        message.error("Failed to copy game ID");
      }
    }
  };

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
      <Content style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <Space orientation="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Space style={{ marginBottom: "1rem" }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/")}
                type="default"
              >
                Back to Main
              </Button>
            </Space>
            <Title level={1}>
              {isAiVsAiMode ? "AI vs AI" : "Player vs AI"}
            </Title>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Space>
                <Text type="secondary" style={{ fontSize: "0.875rem" }}>
                  Game ID:
                </Text>
                <Card
                  size="small"
                  style={{
                    display: "inline-block",
                    padding: "0",
                    margin: 0,
                  }}
                  bodyStyle={{ padding: "0.25rem 0.5rem" }}
                >
                  <Space size="small">
                    <Text code style={{ fontSize: "0.875rem" }}>
                      {gameState.game_id}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={handleCopyGameId}
                      style={{ padding: 0, height: "auto" }}
                    />
                  </Space>
                </Card>
              </Space>
              <Space>
                <Tag
                  color={gameState.status === "completed" ? "green" : "blue"}
                >
                  {gameState.status === "completed"
                    ? "Completed"
                    : "In Progress"}
                </Tag>
                {gameState.winner && (
                  <Tag color="gold">
                    Winner:{" "}
                    {isAiVsAiMode
                      ? gameState.winner === "player_1"
                        ? "AI Player 1"
                        : "AI Player 2"
                      : gameState.winner === "player_1"
                      ? "You"
                      : "AI"}
                  </Tag>
                )}
                {!isGameCompleted && (
                  <Tag color={isPlayer1Turn ? "green" : "orange"}>
                    {isAiVsAiMode
                      ? isPlayer1Turn
                        ? "AI Player 1's Turn"
                        : "AI Player 2's Turn"
                      : isPlayer1Turn
                      ? "Your Turn"
                      : "AI's Turn"}
                  </Tag>
                )}
              </Space>
            </Space>
          </div>

          {!isAiVsAiMode && (
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
                  inputMode="numeric"
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
          )}

          {isAiVsAiMode && !isGameCompleted && (
            <Card title="Game Status" style={{ width: "100%" }}>
              <Text type="secondary">
                Observing AI players compete. The game will update automatically
                as each AI makes their moves.
              </Text>
            </Card>
          )}

          <Card title="Game History" style={{ width: "100%" }}>
            {rounds.length === 0 ? (
              <Text type="secondary">
                {isAiVsAiMode
                  ? "No guesses yet. Waiting for AI players to start..."
                  : "No guesses yet. Make your first guess!"}
              </Text>
            ) : (
              <Space
                orientation="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {rounds.map((round, roundIndex) => {
                  const originalPlayer1Index = round.player1
                    ? gameState.history.findIndex((g) => g === round.player1)
                    : -1;
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
                                {isAiVsAiMode ? (
                                  <RobotOutlined
                                    style={{ color: themeToken.colorPrimary }}
                                  />
                                ) : (
                                  <UserOutlined
                                    style={{ color: themeToken.colorPrimary }}
                                  />
                                )}
                                <Text strong>
                                  {isAiVsAiMode ? "AI Player 1" : "You"}
                                </Text>
                                <Text>guessed:</Text>
                                <Text code style={{ fontSize: "1.2rem" }}>
                                  {round.player1.code}
                                </Text>
                              </Space>
                              <div>
                                <Text>Feedback: </Text>
                                <Tag color="blue">{round.player1.feedback}</Tag>
                              </div>
                              {isAiVsAiMode && round.player1.comments && (
                                <div>
                                  <Button
                                    type="link"
                                    icon={<CommentOutlined />}
                                    onClick={() =>
                                      handleToggleReasoning(
                                        originalPlayer1Index
                                      )
                                    }
                                    style={{
                                      padding: 0,
                                      fontSize: "0.875rem",
                                    }}
                                  >
                                    {expandedReasoning.has(originalPlayer1Index)
                                      ? "Hide"
                                      : "View"}{" "}
                                    AI Reasoning
                                  </Button>
                                  {expandedReasoning.has(
                                    originalPlayer1Index
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
                                      {round.player1.comments}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Space>
                          ) : (
                            <Text type="secondary">
                              {isAiVsAiMode
                                ? "Waiting for AI Player 1's guess..."
                                : "Waiting for your guess..."}
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
                                <Text strong>
                                  {isAiVsAiMode ? "AI Player 2" : "AI"}
                                </Text>
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
                              {isAiVsAiMode
                                ? "Waiting for AI Player 2's guess..."
                                : "Waiting for AI guess..."}
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
      <GameEndModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        winner={gameState.winner}
        isAiVsAiMode={isAiVsAiMode}
      />
    </Layout>
  );
};
