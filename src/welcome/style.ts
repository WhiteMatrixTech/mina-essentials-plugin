import {
  chainIdeColorType,
  getChainIdeThemeColor
} from '@modules/common/theme/chainIdeTheme';

const FONT_LEVEL_ONE = getChainIdeThemeColor(chainIdeColorType.FONT_LEVEL_ONE);
const SUB_BACKGROUND_COLOR = getChainIdeThemeColor(
  chainIdeColorType.INPUT_BACKGROUND
);
const ALL_BACKGROUND = getChainIdeThemeColor(chainIdeColorType.ALL_BACKGROUND);

export const divideStyle: Object = {
  backgroundColor: SUB_BACKGROUND_COLOR
};

export const firstFontStyle: Object = {
  color: FONT_LEVEL_ONE
};

export const secondFontStyle: Object = {
  color: FONT_LEVEL_ONE
};

export const backStyle: Object = {
  backgroundColor: ALL_BACKGROUND
};
