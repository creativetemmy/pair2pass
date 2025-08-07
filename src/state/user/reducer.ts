import { createReducer } from "@reduxjs/toolkit";
import { updateVersion } from "../global/actions";
import { GAS_PRICE_GWEI } from "../types";
import {
  ViewMode,
  setSubgraphHealthIndicatorDisplayed,
  updateGasPrice,
  updateUserUsernameVisibility,
} from "./actions";

const currentTimestamp = () => Date.now();

export interface UserState {
  // the timestamp of the last updateVersion action
  lastUpdateVersionTimestamp?: number;
  isSubgraphHealthIndicatorDisplayed: boolean;
  userPoolStakedOnly: boolean;
  userPoolsViewMode: ViewMode;
  userFarmsViewMode: ViewMode;
  userPredictionAcceptedRisk: boolean;
  userLimitOrderAcceptedWarning: boolean;
  userPredictionChartDisclaimerShow: boolean;
  userPredictionChainlinkChartDisclaimerShow: boolean;
  userUsernameVisibility: boolean;
  gasPrice: string;
  watchlistTokens: string[];
  watchlistPools: string[];
  hideTimestampPhishingWarningBanner: number | null;
}

function pairKey(token0Address: string, token1Address: string) {
  return `${token0Address};${token1Address}`;
}

export const initialState: UserState = {
  isSubgraphHealthIndicatorDisplayed: false,
  userPoolStakedOnly: false,
  userPoolsViewMode: ViewMode.TABLE,
  userFarmsViewMode: ViewMode.TABLE,
  userPredictionAcceptedRisk: false,
  userLimitOrderAcceptedWarning: false,
  userPredictionChartDisclaimerShow: true,
  userPredictionChainlinkChartDisclaimerShow: true,
  userUsernameVisibility: false,
  gasPrice: GAS_PRICE_GWEI.rpcDefault,
  watchlistTokens: [],
  watchlistPools: [],
  hideTimestampPhishingWarningBanner: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateVersion, (state) => {
      state.lastUpdateVersionTimestamp = currentTimestamp();
    })
    .addCase(
      updateUserUsernameVisibility,
      (state, { payload: { userUsernameVisibility } }) => {
        state.userUsernameVisibility = userUsernameVisibility;
      }
    )
    .addCase(updateGasPrice, (state, action) => {
      state.gasPrice = action.payload.gasPrice;
    })

    .addCase(setSubgraphHealthIndicatorDisplayed, (state, { payload }) => {
      state.isSubgraphHealthIndicatorDisplayed = payload;
    })
);
