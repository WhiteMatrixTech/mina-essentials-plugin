import cs from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { IStateTypes } from 'store/types';

import { TemplateCard } from '@modules/common/businessComponents/Template';
import { Scroll } from '@modules/common/components';
import { useChainProfile } from '@modules/common/hooks/chainProfile/useChainProfile';
import {
  LogAction,
  LogOnMount,
  logEvent
} from '@modules/common/utils/analyticsUtils';
import { Locale } from '@modules/editor/actions/locale.actions';
import {
  IChainType,
  TemplateActions
} from '@modules/editor/actions/template.actions';
import { ITemplateState } from '@modules/editor/reducers/template.reducer';

import style from './WelcomeTab.less';
import { divideStyle, firstFontStyle, secondFontStyle } from './style';

interface HomeResource {
  title: string | JSX.Element;
  subTitle: string | JSX.Element;
  imgSrc: string;
  linkSrc: string;
  imgStyle?: object;
}

const externalLinks = {
  [Locale.EN]: 'https://chainide.gitbook.io/chainide-english-1/',
  [Locale.ZH]: 'https://chainide.gitbook.io/chainide-chinese/'
};

const getResourceCard = (cardInfo: HomeResource) => {
  return (
    <div
      key={cardInfo.imgSrc}
      className={cs([style['resource-card'], 'resource'])}
      onClick={() => {
        window.open(cardInfo.linkSrc);
        logEvent({
          eventType: 'RESOURCE_CARD',
          action: LogAction.click,
          extra: { cardTitle: cardInfo.title }
        });
      }}
    >
      <div className={style['img-wrapper']}>
        <img src={cardInfo.imgSrc} alt="Homepage" style={cardInfo.imgStyle} />
      </div>
      <div style={firstFontStyle} className={style['resource-card-title']}>
        {cardInfo.title}
      </div>
      <div style={secondFontStyle} className={style['resource-card-subtitle']}>
        {cardInfo.subTitle ? cardInfo.subTitle : cardInfo.subTitle}
      </div>
    </div>
  );
};

export function WelcomeTab() {
  const dispatch = useDispatch();
  const chain = useChainProfile();

  const { language } = useSelector((state: IStateTypes) => state.language);

  const resourceCardList: HomeResource[] = useMemo(() => {
    return [
      {
        title: <FormattedMessage id="WELCOME_HOMEPAGE" />,
        subTitle: <FormattedMessage id="WELCOME_HOMEPAGE_SUB_TITLE" />,
        imgSrc: require('../../../../../assets/static/img/sui/resource-homepage.png'),
        linkSrc: 'https://chainide.com/'
      },
      {
        title: <FormattedMessage id="SUI_WELCOME_EXPLORER" />,
        subTitle: <FormattedMessage id="SUI_WELCOME_EXPLORER_SUBTITLE" />,
        imgSrc: require('../../../../../assets/static/img/sui/resource-explorer.png'),
        linkSrc: 'https://starkscan.co/'
      },
      {
        title: <FormattedMessage id="WELCOME_CHAINIDE_DOCUMENT" />,
        subTitle: <FormattedMessage id="WELCOME_CHAINIDE_DOCUMENT_SUBTITLE" />,
        imgSrc: require('../../../../../assets/static/img/sui/resource-document.png'),
        linkSrc: externalLinks[language],
        imgStyle: { marginTop: '6px' }
      },
      {
        title: <FormattedMessage id="WELCOME_OFFICIAL_FORUMS" />,
        subTitle: (
          <FormattedMessage
            id="WELCOME_OFFICIAL_FORUMS_SUBTITLE"
            values={{ chain: 'Starknet' }}
          />
        ),
        imgSrc: require('../../../../../assets/static/img/sui/resource-forums.png'),
        linkSrc: 'https://forum.chainide.com/'
      }
    ];
  }, [language]);

  const templateState: ITemplateState = useSelector(
    (state: IStateTypes) => state.template
  );
  const { templates } = templateState;

  useEffect(() => {
    dispatch(TemplateActions.loadTemplates(chain as IChainType, true));
  }, [chain, dispatch]);

  return (
    <Scroll>
      <div className={style.welcomePage}>
        <LogOnMount eventType="WELCOME_EXPOSURE" action={LogAction.exposure} />
        <div className={style.head}></div>
        <img
          src={require('../../../../../assets/static/img/img-logo-chainide.png')}
          width="290px"
          alt="ChainIDE"
        />

        <div style={secondFontStyle} className={style['ide-introduction']}>
          <FormattedMessage id="WELCOME_WELCOME_TITLE" />
          <img
            src={require('../../../../../assets/static/img/starknet/starknet.png')}
            alt="starknet logo"
          />
          Starknet
        </div>
        <a href="https://chainide.com/" target="_blank" rel="noreferrer">
          <img
            src={require('../../../../../assets/static/img/welcome/chainideV2.1.1.svg')}
            width="106px"
            height="22px"
            alt="https://chainide.com/"
          />
        </a>
        <div className={style['ide-resource']}>
          {resourceCardList.map((card) => getResourceCard(card))}
        </div>
        <div style={divideStyle} className={style.divide}></div>
        <div style={firstFontStyle} className={style['first-level-title']}>
          <FormattedMessage id="TEMPLATE_TEMPLATES" />
        </div>
        <div className={style['template-list']}>
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      </div>
    </Scroll>
  );
}
