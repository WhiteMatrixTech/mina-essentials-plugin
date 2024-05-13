import { InputProps } from '@modules/common/components';

export const inputStyles = {
  field: {
    backgroundColor: '#393A3B',
    borderRadius: '2px'
  },
  fieldGroup: {
    height: '22px',
    width: '100%'
  },
  root: {
    selectors: {
      input: {
        lineHeight: '22px'
      },
      '.ms-Label': {
        textAlign: 'right',
        width: '100px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '13px',
        paddingRight: '6px'
      }
    }
  },
  wrapper: {
    display: 'flex'
  }
} as InputProps;

export const stackStyles = {
  root: {
    padding: '12px',
    backgroundColor: '#2D2D2D',
    margin: '0 26px'
  }
};
