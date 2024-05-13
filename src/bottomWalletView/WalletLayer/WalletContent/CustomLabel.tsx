import React from 'react';
import {
  IStackTokens,
  ITextFieldProps,
  Stack,
  mergeStyles
} from 'office-ui-fabric-react';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';

const stackTokens: IStackTokens = {
  childrenGap: 4
};

const iconClass = mergeStyles({
  fontSize: 14,
  height: 14,
  width: 14,
  margin: '0 4px'
});

export interface CustomLabelProps extends ITextFieldProps {
  tips: string;
}

export const CustomLabel = (props: CustomLabelProps): JSX.Element => {
  return (
    <Stack
      horizontal={true}
      verticalAlign="center"
      tokens={stackTokens}
      styles={{ root: { padding: '5px 0px' } }}>
      <span id={props.id}>{props.label}</span>
      <FontIcon
        iconName="Info"
        className={iconClass}
        title={props.tips}
        aria-label={props.tips}
      />
    </Stack>
  );
};
