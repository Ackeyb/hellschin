import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { players, config } = req.body;
  const gameId = "sampleGame"; // Œã‚Ù‚ÇUUID‚È‚Ç‚É

  const initialState = {
    players: players.map((name: string) => ({
      name,
      hasRolled: false,
      eliminated: false
    })),
    round: 1,
    currentPlayerIndex: 0,
    currentCups: config.startCups,
    config,
    suddenDeath: false
  };

  await setDoc(doc(collection(db, "games"), gameId), initialState);
  res.status(200).json({ gameId });
}
