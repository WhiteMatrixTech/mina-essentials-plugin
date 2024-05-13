import {
  chainIdeColorType,
  getChainIdeThemeColor
} from '@modules/common/theme/chainIdeTheme';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { IStackStyles } from 'office-ui-fabric-react';

const FONT_LEVEL_ONE = getChainIdeThemeColor(chainIdeColorType.FONT_LEVEL_ONE);
const INPUT_BACKGROUND = getChainIdeThemeColor(
  chainIdeColorType.INPUT_BACKGROUND
);

export const wrapperStyle: Object = {
  backgroundColor: getChainIdeThemeColor(
    chainIdeColorType.LEFT_AND_RIGHT_PANE_BACKGROUND
  )
};

export const headerStyle: IStackStyles = {
  root: {
    padding: '14px 16px',
    borderBottom: `1px solid ${INPUT_BACKGROUND}`
  }
};

export const leftStyles: IStackStyles = {
  root: {
    flexGrow: 1,
    maxWidth: '72%'
  }
};

export const rightStyles: IStackStyles = {
  root: {
    textAlign: 'right',
    flexGrow: 0
  }
};

export const dropDownStyles = {
  root: {
    selectors: {
      '.ms-Dropdown-caretDownWrapper': {
        display: 'none'
      }
    }
  },
  title: {
    borderStyle: 'none',
    height: '24px',
    lineHeight: '24px',
    backgroundColor: INPUT_BACKGROUND
  },
  caretDownWrapper: {
    height: '24px',
    lineHeight: '24px'
  }
};

export const avatarIconClass = mergeStyles({
  padding: 5,
  fontSize: 13,
  height: 22,
  width: 22,
  marginLeft: '13px',
  cursor: 'pointer'
});

export const closeIconClass = mergeStyles({
  padding: 5,
  fontSize: 13,
  height: 22,
  width: 22,
  marginLeft: '4px',
  cursor: 'pointer'
});

export const btnStyle = {
  root: {
    selectors: {
      '.ms-Button-flexContainer': {
        flexDirection: 'row-reverse'
      }
    }
  }
};

export const thirdFontStyle = {
  color: getChainIdeThemeColor(chainIdeColorType.FONT_LEVEL_THREE)
};

export const accountStyles: IStackStyles = {
  root: {
    selectors: {
      '.account:hover': {
        backgroundColor: getChainIdeThemeColor(chainIdeColorType.ALL_BACKGROUND)
      },
      '.ms-Icon': {
        fontSize: 18,
        height: 18,
        width: 18,
        marginRight: '8px',
        color: FONT_LEVEL_ONE
      }
    }
  }
};

export const borderStyle = {
  borderTop: `1px solid ${INPUT_BACKGROUND}`
};
