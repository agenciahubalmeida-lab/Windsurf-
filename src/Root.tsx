import React from "react";
import { Composition } from "remotion";
import { HubAlmeidaVideo } from "./HubAlmeidaVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HubAlmeidaAd"
        component={HubAlmeidaVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
