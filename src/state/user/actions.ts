import { createAction } from "@reduxjs/toolkit";

export enum FarmStakedOnly {
  ON_FINISHED = "onFinished",
  TRUE = "true",
  FALSE = "false",
}

export enum ViewMode {
  TABLE = "TABLE",
  CARD = "CARD",
}

export const updateUserUsernameVisibility = createAction<{
  userUsernameVisibility: boolean;
}>("user/updateUserUsernameVisibility");
export const updateGasPrice = createAction<{ gasPrice: string }>(
  "user/updateGasPrice"
);

/**
 * @deprecated
 */
export const addWatchlistToken = createAction<{ address: string }>(
  "user/addWatchlistToken"
);
/**
 * @deprecated
 */
export const addWatchlistPool = createAction<{ address: string }>(
  "user/addWatchlistPool"
);

export const setSubgraphHealthIndicatorDisplayed = createAction<boolean>(
  "user/setSubgraphHealthIndicatorDisplayed"
);
