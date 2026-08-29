"use client";

import { createContext, useContext } from "react";

export type BoardEditorUser = {
  id: string;
  name: string;
  image: string | null;
};

export const BoardEditorUserContext = createContext<BoardEditorUser | null>(
  null,
);

export function useBoardEditorUser() {
  return useContext(BoardEditorUserContext);
}
