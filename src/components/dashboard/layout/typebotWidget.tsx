// "use client";
// import { Bubble } from "@typebot.io/nextjs";

// import { use } from "react";

// const TypebotUI = () => {
//   return (
//     <Bubble
//       typebot="suporte"
//       apiHost="https://atendimento.bizzbot.com.br"
//       theme={{
//         button: { backgroundColor: "#600a80", size: "medium" },
//         placement: "left",
//       }}
//     />
//   );
// };

// export default TypebotUI;
"use client";

import { Bubble } from "@typebot.io/nextjs";

export default function ClientWidget() {
  return (
    <Bubble
      typebot="suporte"
      apiHost="https://atendimento.bizzbot.com.br"
      previewMessage={{
        message: "Acesse aqui o suporte",
        autoShowDelay: 5000,
        avatarUrl:
          "https://s3.typebot.io/public/workspaces/cll8dggdp006tmd0gibq90vqw/typebots/clofq65s8000klc0fwccvy5pi/hostAvatar?v=1702427210238",
      }}
      theme={{ button: { backgroundColor: "#600a80" } }}
    />
  );
}
