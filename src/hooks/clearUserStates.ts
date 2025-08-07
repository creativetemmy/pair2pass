import { resetUserState } from "@/state/global/actions";
import { Dispatch } from "@reduxjs/toolkit";

export const clearUserStates = (
  dispatch: Dispatch<any>,
  {
    chainId,
    newChainId,
  }: {
    chainId?: number;
    newChainId?: number;
  }
) => {
  if (chainId) {
    dispatch(resetUserState({ chainId, newChainId }));
  }
};
