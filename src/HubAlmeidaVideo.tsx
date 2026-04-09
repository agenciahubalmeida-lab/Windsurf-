import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

// ─── Palette ────────────────────────────────────────────────────────────────
const BLUE = "#1a6cf6";
const WHITE = "#ffffff";
const BLACK = "#0a0a0a";
const GRAY_LIGHT = "#f5f5f5";
const FONT = "'DM Sans', sans-serif";

// ─── Spring config ───────────────────────────────────────────────────────────
const SPRING_CONFIG = { damping: 14, stiffness: 120, mass: 0.8 };

// ─── Animation hooks ─────────────────────────────────────────────────────────

/** fadeUp: translateY 40→0px + opacity 0→1 */
function useFadeUp(frame: number, delay: number, fps: number) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
  };
}

/** scaleIn: scale 0.88→1 + opacity 0→1 */
function useScaleIn(frame: number, delay: number, fps: number) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPRING_CONFIG,
  });
  return {
    opacity: progress,
    transform: `scale(${interpolate(progress, [0, 1], [0.88, 1])})`,
  };
}

// ─── Scene 1 — frames 0–120 — fundo branco ───────────────────────────────────
// "Toda empresa tem" / "um problema" / "que consome tempo…"
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const l1 = useFadeUp(frame, 0, fps);
  const l2 = useFadeUp(frame, 13, fps);
  const l3 = useFadeUp(frame, 26, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      {/* Line 1 */}
      <div style={{ ...l1, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
            display: "block",
          }}
        >
          Toda empresa tem
        </span>
      </div>

      {/* Line 2 — "problema" em azul */}
      <div style={{ ...l2, marginBottom: 20 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          um{" "}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1.1,
          }}
        >
          problema
        </span>
      </div>

      {/* Line 3 */}
      <div style={{ ...l3 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 52,
            fontWeight: 400,
            color: "#555555",
            lineHeight: 1.35,
            display: "block",
          }}
        >
          que consome tempo, dinheiro e energia todo dia.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 — frames 120–240 — fundo azul ───────────────────────────────────
// 3 itens em lista
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const i1 = useFadeUp(frame, 0, fps);
  const i2 = useFadeUp(frame, 14, fps);
  const i3 = useFadeUp(frame, 28, fps);

  const itemStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 64,
    fontWeight: 700,
    color: WHITE,
    lineHeight: 1.2,
    display: "block",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLUE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ ...i1, marginBottom: 36 }}>
        <span style={itemStyle}>Atendimento lento.</span>
      </div>
      <div style={{ ...i2, marginBottom: 36 }}>
        <span style={itemStyle}>Lead sem resposta.</span>
      </div>
      <div style={{ ...i3 }}>
        <span style={itemStyle}>Processo manual que não escala.</span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3 — frames 240–390 — fundo branco ─────────────────────────────────
// "E se esse problema / fosse resolvido por uma IA / treinada para o seu negócio?"
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const l1 = useFadeUp(frame, 0, fps);
  const l2 = useFadeUp(frame, 13, fps);
  const l3 = useFadeUp(frame, 26, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ ...l1, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 400,
            color: "#555555",
            lineHeight: 1.3,
            display: "block",
          }}
        >
          E se esse problema
        </span>
      </div>

      <div style={{ ...l2, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 400,
            color: "#555555",
            lineHeight: 1.3,
            display: "block",
          }}
        >
          fosse resolvido por uma IA
        </span>
      </div>

      {/* Line 3 — "seu" em azul */}
      <div style={{ ...l3 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 68,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          treinada para o{" "}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 68,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1.1,
          }}
        >
          seu
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 68,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          {" "}negócio?
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4 — frames 390–540 — fundo cinza claro ────────────────────────────
// "Não vendemos…" / linha divisória / "Construímos o agente…"
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const b1 = useFadeUp(frame, 0, fps);
  const divAnim = useFadeUp(frame, 15, fps);
  const b2 = useFadeUp(frame, 25, fps);

  // Width da linha azul animada com spring (0 → 60px)
  const divProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: SPRING_CONFIG,
  });
  const dividerWidth = interpolate(divProgress, [0, 1], [0, 60]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: GRAY_LIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ ...b1, marginBottom: 36 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 64,
            fontWeight: 400,
            color: "#888888",
            lineHeight: 1.2,
            display: "block",
          }}
        >
          Não vendemos um agente pronto.
        </span>
      </div>

      {/* Linha divisória azul com animação de largura */}
      <div style={{ ...divAnim, marginBottom: 36 }}>
        <div
          style={{
            width: dividerWidth,
            height: 3,
            backgroundColor: BLUE,
          }}
        />
      </div>

      {/* "seu negócio" em azul */}
      <div style={{ ...b2 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          Construímos o agente que o{" "}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1.1,
          }}
        >
          seu negócio
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          {" "}precisa.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 — frames 540–690 — fundo azul ───────────────────────────────────
// 3 perguntas + resposta no frame 42 da cena
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const q1 = useFadeUp(frame, 0, fps);
  const q2 = useFadeUp(frame, 12, fps);
  const q3 = useFadeUp(frame, 24, fps);
  const ans = useFadeUp(frame, 42, fps);

  const questionStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: 58,
    fontWeight: 400,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.3,
    display: "block",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLUE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ ...q1, marginBottom: 28 }}>
        <span style={questionStyle}>Precisa qualificar leads?</span>
      </div>
      <div style={{ ...q2, marginBottom: 28 }}>
        <span style={questionStyle}>Precisa reduzir cancelamentos?</span>
      </div>
      <div style={{ ...q3, marginBottom: 56 }}>
        <span style={questionStyle}>Precisa automatizar suporte?</span>
      </div>

      <div style={{ ...ans }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1.1,
            display: "block",
          }}
        >
          Existe um agente para isso.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6 — frames 690–810 — fundo branco ─────────────────────────────────
// "Você traz o problema. / Nós construímos a solução."
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const l1 = useFadeUp(frame, 0, fps);
  const l2 = useFadeUp(frame, 13, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: WHITE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      {/* "problema." em azul */}
      <div style={{ ...l1, marginBottom: 24 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          Você traz o{" "}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1.1,
          }}
        >
          problema.
        </span>
      </div>

      {/* "solução." em azul */}
      <div style={{ ...l2 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLACK,
            lineHeight: 1.1,
          }}
        >
          Nós construímos a{" "}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 72,
            fontWeight: 900,
            color: BLUE,
            lineHeight: 1.1,
          }}
        >
          solução.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 7 — frames 810–900 — fundo azul (encerramento) ────────────────────
// Logo + tagline + URL
const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = useScaleIn(frame, 0, fps);
  const tagline = useFadeUp(frame, 20, fps);
  const url = useFadeUp(frame, 35, fps);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLUE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
      }}
    >
      {/* Logo — usar imagem se disponível, senão texto */}
      <div style={{ ...logo, textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 96,
            fontWeight: 900,
            color: WHITE,
            lineHeight: 1,
            letterSpacing: "-2px",
            display: "block",
          }}
        >
          HUB ALMEIDA
        </span>
      </div>

      <div style={{ ...tagline, textAlign: "center", marginBottom: 20 }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 400,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.3,
            display: "block",
          }}
        >
          Engenharia de IA sob demanda.
        </span>
      </div>

      <div style={{ ...url, textAlign: "center" }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 38,
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.3,
            display: "block",
          }}
        >
          hubalmeida.com.br
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Composição principal ─────────────────────────────────────────────────────
export const HubAlmeidaVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Cena 1 — frames 0–120 — fundo branco */}
      <Sequence from={0} durationInFrames={120}>
        <Scene1 />
      </Sequence>

      {/* Cena 2 — frames 120–240 — fundo azul */}
      <Sequence from={120} durationInFrames={120}>
        <Scene2 />
      </Sequence>

      {/* Cena 3 — frames 240–390 — fundo branco */}
      <Sequence from={240} durationInFrames={150}>
        <Scene3 />
      </Sequence>

      {/* Cena 4 — frames 390–540 — fundo cinza claro */}
      <Sequence from={390} durationInFrames={150}>
        <Scene4 />
      </Sequence>

      {/* Cena 5 — frames 540–690 — fundo azul */}
      <Sequence from={540} durationInFrames={150}>
        <Scene5 />
      </Sequence>

      {/* Cena 6 — frames 690–810 — fundo branco */}
      <Sequence from={690} durationInFrames={120}>
        <Scene6 />
      </Sequence>

      {/* Cena 7 — frames 810–900 — fundo azul */}
      <Sequence from={810} durationInFrames={90}>
        <Scene7 />
      </Sequence>
    </AbsoluteFill>
  );
};
